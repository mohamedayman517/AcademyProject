import { Component, OnDestroy, OnInit } from '@angular/core';
import { LanguageService, AppLanguage } from '../../services/language.service';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit, OnDestroy {
  loading = true;
  error: string | null = null;

  user: any = null;
  lastLogin: string = '';
  emailForConfirm: string = '';
  phone: string = '';
  phoneCode: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  twoFactorEnabled = false;

  academies: any[] = [];
  branches: any[] = [];
  selectedAcademy: string = '';
  selectedBranch: string = '';
  loadingAcademyData = false;
  get branchesForSelectedAcademy(): any[] {
    const aid = this.selectedAcademy;
    const list = Array.isArray(this.branches) ? this.branches : [];
    if (!aid) return list;
    return list.filter((b: any) => {
      const branchAcademyId = b.academyDataId || b.AcademyDataId || b.academyId || b.AcademyId;
      return branchAcademyId === aid;
    });
  }

  studentData: any = null;
  linkedIn: string = '';
  facebook: string = '';

  busyAction: string = '';

  profileFile: File | null = null;
  profilePreviewUrl: string = '';
  tempPreviewUrl: string = '';

  userStats: { courses: number; students: number; teachers: number; academies: number } | null = null;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private sanitizer: DomSanitizer,
    private lang: LanguageService,
  ) {}

  ngOnInit(): void {
    this.initialize();
  }

  setLang(l: AppLanguage): void {
    this.lang.set(l);
  }

  ngOnDestroy(): void {
    if (this.tempPreviewUrl) URL.revokeObjectURL(this.tempPreviewUrl);
    if (this.profilePreviewUrl) URL.revokeObjectURL(this.profilePreviewUrl);
  }

  private async initialize(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const me = await this.api.accountMe().toPromise();
      this.user = me || null;
      this.emailForConfirm = this.user?.email || this.user?.Email || '';
      this.phone = this.user?.phoneNumber || this.user?.PhoneNumber || '';
      this.twoFactorEnabled = !!(this.user?.twoFactorEnabled || this.user?.TwoFactorEnabled);

      await Promise.all([
        this.loadAcademyAndBranches(),
        this.tryLoadStudentData(),
        this.loadLastLogin(),
        this.loadProfilePicture(),
        this.loadAdminStatsIfAdmin(),
      ]);
    } catch (e: any) {
      if (e?.status === 401) {
        this.error = 'يرجى تسجيل الدخول';
      } else {
        this.error = e?.message || 'فشل تحميل الحساب';
      }
    } finally {
      this.loading = false;
    }
  }

  private get userId(): string {
    const u = this.user || {};
    return (
      u.id || u.Id || u.userId || u.UserId || u.guid || u.Guid || ''
    );
  }

  private async loadAcademyAndBranches(): Promise<void> {
    this.loadingAcademyData = true;
    try {
      const [academies, branches] = await Promise.all([
        this.api.getAcademyData().toPromise(),
        this.api.getBranchesData().toPromise(),
      ]);
      this.academies = Array.isArray(academies) ? academies : [];
      this.branches = Array.isArray(branches) ? branches : [];
    } finally {
      this.loadingAcademyData = false;
    }
  }

  private async tryLoadStudentData(): Promise<void> {
    try {
      const all = await this.api.getStudentData().toPromise();
      const email = this.user?.email || this.user?.Email || '';
      const current = Array.isArray(all) ? all.find((s: any) =>
        s.studentEmail === email || s.StudentEmail === email || s.email === email || s.Email === email
      ) : null;
      if (current) {
        this.studentData = current;
        this.linkedIn = current.linkedIn || current.LinkedIn || '';
        this.facebook = current.facebook || current.Facebook || '';
        this.phone = current.studentPhone || current.StudentPhone || current.studentMobil || current.StudentMobil || this.phone;
        this.selectedAcademy = current.academyDataId || current.AcademyDataId || '';
        this.selectedBranch = current.branchesDataId || current.BranchesDataId || '';
      }
    } catch {}
  }

  private async loadLastLogin(): Promise<void> {
    try {
      const id = this.userId;
      if (!id) return;
      const res = await this.api.accountLastLoginTime(id).toPromise();
      this.lastLogin = typeof res === 'string' ? res : (res?.lastLogin || '');
    } catch {}
  }

  private async loadProfilePicture(): Promise<void> {
    try {
      const id = this.userId;
      if (!id) return;
      const blob = await this.api.accountGetProfilePicture(id).toPromise();
      if (blob && (blob as any).size) {
        const url = URL.createObjectURL(blob);
        this.profilePreviewUrl = url;
      }
    } catch {}
  }

  private async loadAdminStatsIfAdmin(): Promise<void> {
    const isAdmin = this.auth.isAdmin();
    if (!isAdmin) return;
    try {
      const [courses, students, teachers, academies] = await Promise.all([
        this.api.getAcademyCourses().toPromise(),
        this.api.getStudentData().toPromise(),
        this.api.getTeacherData().toPromise(),
        this.api.getAcademyData().toPromise(),
      ]);
      this.userStats = {
        courses: Array.isArray(courses) ? courses.length : 0,
        students: Array.isArray(students) ? students.length : 0,
        teachers: Array.isArray(teachers) ? teachers.length : 0,
        academies: Array.isArray(academies) ? academies.length : 0,
      };
    } catch {}
  }

  handleFileChange(e: any): void {
    const file: File | null = e?.target?.files?.[0] || null;
    this.profileFile = file;
    if (this.tempPreviewUrl) URL.revokeObjectURL(this.tempPreviewUrl);
    if (file) {
      this.tempPreviewUrl = URL.createObjectURL(file);
    } else {
      this.tempPreviewUrl = '';
    }
  }

  async uploadProfile(): Promise<void> {
    if (!this.profileFile) return;
    await this.withBusy('upload', async () => {
      const id = this.userId;
      if (!id) throw new Error('تعذر تحديد معرف المستخدم');
      await this.api.accountUploadProfilePicture(id, this.profileFile as File).toPromise();
      setTimeout(() => this.loadProfilePicture(), 600);
    });
  }

  async saveSocialAndStudent(): Promise<void> {
    await this.withBusy('updateSocial', async () => {
      const linkedInUrl = (this.linkedIn || '').trim();
      const facebookUrl = (this.facebook || '').trim();

      const urlRegex = /^https?:\/\/.+/;
      if (linkedInUrl && !urlRegex.test(linkedInUrl)) throw new Error('رابط LinkedIn غير صحيح');
      if (facebookUrl && !urlRegex.test(facebookUrl)) throw new Error('رابط Facebook غير صحيح');

      const phoneNumber = this.ensurePhone(this.phone);

      if (this.studentData?.id || this.studentData?.Id) {
        const id = this.studentData.id || this.studentData.Id;
        const payload = {
          ...this.studentData,
          linkedIn: linkedInUrl || null,
          facebook: facebookUrl || null,
          studentPhone: phoneNumber,
          studentMobil: phoneNumber,
          academyDataId: this.selectedAcademy || this.studentData.academyDataId || this.studentData.AcademyDataId || '',
          branchesDataId: this.selectedBranch || this.studentData.branchesDataId || this.studentData.BranchesDataId || '',
        };
        this.studentData = await this.api.updateStudentData(id, payload as any).toPromise().catch(async () => {
          // Fallback: try StudentData update endpoint name
          return this.api.updateStudentData(id, payload as any).toPromise();
        });
      } else {
        const fullName = this.user?.fullName || `${this.user?.firstName || ''} ${this.user?.lastName || ''}`.trim() || 'User';
        const createPayload = {
          studentNameL1: fullName,
          studentNameL2: fullName,
          studentAddress: 'N/A',
          studentPhone: phoneNumber,
          studentEmail: this.user?.email || this.user?.Email,
          linkedIn: linkedInUrl || null,
          facebook: facebookUrl || null,
          academyDataId: this.selectedAcademy || '',
          branchesDataId: this.selectedBranch || '',
          active: true,
          language: 'ar',
          trainingProvider: 'Academy System',
          studentMobil: phoneNumber,
        } as any;
        this.studentData = await this.api.createStudentData(createPayload).toPromise();
      }
    });
  }

  private ensurePhone(p: string): string {
    let v = (p || '').trim();
    if (!v || v.length < 7) v = this.user?.phoneNumber || this.user?.PhoneNumber || '1234567';
    if (v.length > 12) v = v.slice(0, 12);
    return v;
  }

  async changePassword(): Promise<void> {
    await this.withBusy('changePass', async () => {
      await this.api.accountChangePassword({ currentPassword: this.currentPassword, newPassword: this.newPassword }).toPromise();
      this.currentPassword = '';
      this.newPassword = '';
    });
  }

  async sendEmailConfirm(): Promise<void> {
    await this.withBusy('sendEmail', async () => {
      await this.api.accountSendEmailConfirmation({ email: this.emailForConfirm }).toPromise();
    });
  }

  async sendPhoneCode(): Promise<void> {
    await this.withBusy('sendPhone', async () => {
      await this.api.accountSendPhoneCode({ phoneNumber: this.phone }).toPromise();
    });
  }

  async confirmPhone(): Promise<void> {
    await this.withBusy('confirmPhone', async () => {
      await this.api.accountConfirmPhone({ phoneNumber: this.phone, code: this.phoneCode }).toPromise();
      this.phoneCode = '';
      this.twoFactorEnabled = true;
    });
  }

  async enable2FA(): Promise<void> {
    await this.withBusy('2fa', async () => {
      const id = this.userId; if (!id) throw new Error('لا يوجد معرف المستخدم');
      await this.api.accountEnable2fa(id).toPromise();
      this.twoFactorEnabled = true;
    });
  }

  async disable2FA(): Promise<void> {
    await this.withBusy('2fa', async () => {
      const id = this.userId; if (!id) throw new Error('لا يوجد معرف المستخدم');
      await this.api.accountDisable2fa(id).toPromise();
      this.twoFactorEnabled = false;
    });
  }

  async refreshToken(): Promise<void> {
    await this.withBusy('refresh', async () => {
      await this.auth.refreshToken().toPromise();
    });
  }

  async revokeToken(): Promise<void> {
    await this.withBusy('revoke', async () => {
      // We only clear locally in this app; backend revoke can be added if needed
      this.auth.logout();
    });
  }

  logout(): void {
    this.auth.logout();
    window.location.href = '/login';
  }

  async withBusy(name: string, fn: () => Promise<void>): Promise<void> {
    this.busyAction = name;
    try {
      await fn();
    } catch (e: any) {
      this.error = e?.message || 'فشلت العملية';
    } finally {
      this.busyAction = '';
    }
  }
}


