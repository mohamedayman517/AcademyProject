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

  get isRtl(): boolean {
    return this.lang.current === 'ar';
  }

  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  get isUser(): boolean {
    return this.user?.role === 'User' || this.user?.role === 'Student';
  }

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
        this.error = this.isRtl ? 'يرجى تسجيل الدخول' : 'Please log in';
      } else {
        this.error = e?.message || (this.isRtl ? 'فشل تحميل الحساب' : 'Failed to load account');
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
    } catch (error) {
      console.error('Error loading academy data:', error);
      this.academies = [];
      this.branches = [];
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
        
        // Only set academy and branch if they are valid (not empty or placeholder values)
        const academyId = current.academyDataId || current.AcademyDataId || '';
        const branchId = current.branchesDataId || current.BranchesDataId || '';
        
        // Check if the academy and branch IDs are valid (not placeholder values like 'gggg', 'dddd')
        if (academyId && 
            academyId !== 'gggg' && 
            academyId !== 'dddd' && 
            academyId.length > 3 &&
            this.isValidUUID(academyId)) {
          this.selectedAcademy = academyId;
        } else {
          // Clear invalid academy data
          this.selectedAcademy = '';
        }
        if (branchId && 
            branchId !== 'gggg' && 
            branchId !== 'dddd' && 
            branchId.length > 3 &&
            this.isValidUUID(branchId)) {
          this.selectedBranch = branchId;
        } else {
          // Clear invalid branch data
          this.selectedBranch = '';
        }
        
        // Clean up invalid data in studentData if needed
        this.cleanupInvalidStudentData();
      }
    } catch (error) {
      console.log('Could not load student data:', error);
    }
  }

  private cleanupInvalidStudentData(): void {
    if (!this.studentData) return;
    
    const academyId = this.studentData.academyDataId || this.studentData.AcademyDataId || '';
    const branchId = this.studentData.branchesDataId || this.studentData.BranchesDataId || '';
    
    console.log('Cleaning up invalid student data:', { academyId, branchId });
    
    // If we have invalid data, clear it from studentData
    if (academyId && (!this.isValidUUID(academyId) || academyId === 'gggg' || academyId === 'dddd')) {
      console.log('Clearing invalid academy data:', academyId);
      this.studentData.academyDataId = '';
      this.studentData.AcademyDataId = '';
    }
    
    if (branchId && (!this.isValidUUID(branchId) || branchId === 'gggg' || branchId === 'dddd')) {
      console.log('Clearing invalid branch data:', branchId);
      this.studentData.branchesDataId = '';
      this.studentData.BranchesDataId = '';
    }
  }

  private async loadLastLogin(): Promise<void> {
    try {
      const id = this.userId;
      if (!id) return;
      const res = await this.api.accountLastLoginTime(id).toPromise();
      this.lastLogin = typeof res === 'string' ? res : (res?.lastLogin || '');
    } catch (error) {
      console.log('Last login time not available:', error);
    }
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
    } catch (error) {
      console.log('Profile picture not available:', error);
    }
  }

  private async loadAdminStatsIfAdmin(): Promise<void> {
    if (!this.isAdmin) return;
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
    } catch (error) {
      console.warn('Failed to load user stats:', error);
    }
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
      if (!id) throw new Error(this.isRtl ? 'تعذر تحديد معرف المستخدم' : 'Unable to resolve user ID');
      await this.api.accountUploadProfilePicture(id, this.profileFile as File).toPromise();
      
      setTimeout(async () => {
        try {
          const blob = await this.api.accountGetProfilePicture(id).toPromise();
          if (blob && (blob as any).size) {
            if (this.profilePreviewUrl) {
              URL.revokeObjectURL(this.profilePreviewUrl);
            }
            const url = URL.createObjectURL(blob);
            this.profilePreviewUrl = url;
          } else {
            if (this.tempPreviewUrl) {
              if (this.profilePreviewUrl) {
                URL.revokeObjectURL(this.profilePreviewUrl);
              }
              this.profilePreviewUrl = this.tempPreviewUrl;
            }
          }
        } catch (e) {
          console.warn('Failed to load uploaded profile picture:', e);
          if (this.tempPreviewUrl) {
            if (this.profilePreviewUrl) {
              URL.revokeObjectURL(this.profilePreviewUrl);
            }
            this.profilePreviewUrl = this.tempPreviewUrl;
          }
        }
      }, 600);
    });
  }

  async saveSocialAndStudent(): Promise<void> {
    await this.withBusy('updateSocial', async () => {
      const linkedInUrl = (this.linkedIn || '').trim();
      const facebookUrl = (this.facebook || '').trim();

      // Validate URLs
      const urlRegex = /^https?:\/\/.+/;
      if (linkedInUrl && !urlRegex.test(linkedInUrl)) {
        throw new Error(this.isRtl ? 'رابط LinkedIn غير صحيح' : 'Invalid LinkedIn URL');
      }
      if (facebookUrl && !urlRegex.test(facebookUrl)) {
        throw new Error(this.isRtl ? 'رابط Facebook غير صحيح' : 'Invalid Facebook URL');
      }

      // Validate phone number according to API schema (7-12 characters)
      if (this.phone && (this.phone.length < 7 || this.phone.length > 12)) {
        throw new Error(this.isRtl ? 'رقم الهاتف يجب أن يكون بين 7 و 12 رقم' : 'Phone number must be between 7 and 12 digits');
      }

      const phoneNumber = this.ensurePhone(this.phone);
      
      // Validate required fields for student data
      if (!this.user?.email && !this.user?.Email) {
        throw new Error(this.isRtl ? 'البريد الإلكتروني مطلوب' : 'Email is required');
      }

      if (this.studentData?.id || this.studentData?.Id) {
        // Update existing student data
        const id = this.studentData.id || this.studentData.Id;
        // Only update academy and branch if they are valid
        const currentAcademyId = this.studentData.academyDataId || this.studentData.AcademyDataId || '';
        const currentBranchId = this.studentData.branchesDataId || this.studentData.BranchesDataId || '';
        
        // Create payload with only the required fields for StudentDataDto
        const payload = {
          id: this.studentData.id || this.studentData.Id,
          academyDataId: this.selectedAcademy && this.isValidUUID(this.selectedAcademy) ? 
                         this.selectedAcademy : 
                         (this.isValidUUID(currentAcademyId) ? currentAcademyId : null),
          branchesDataId: this.selectedBranch && this.isValidUUID(this.selectedBranch) ? 
                         this.selectedBranch : 
                         (this.isValidUUID(currentBranchId) ? currentBranchId : null),
          studentCode: this.studentData.studentCode || this.studentData.StudentCode || null,
          studentBarCode: this.studentData.studentBarCode || this.studentData.StudentBarCode || null,
          studentNameL1: this.studentData.studentNameL1 || this.studentData.StudentNameL1 || this.user?.fullName || `${this.user?.firstName || ''} ${this.user?.lastName || ''}`.trim() || 'User',
          studentNameL2: this.studentData.studentNameL2 || this.studentData.StudentNameL2 || this.user?.fullName || `${this.user?.firstName || ''} ${this.user?.lastName || ''}`.trim() || 'User',
          countryCodeId: this.studentData.countryCodeId || this.studentData.CountryCodeId || null,
          governorateCodeId: this.studentData.governorateCodeId || this.studentData.GovernorateCodeId || null,
          cityCodeId: this.studentData.cityCodeId || this.studentData.CityCodeId || null,
          studentAddress: this.studentData.studentAddress || this.studentData.StudentAddress || 'N/A',
          studentPhone: phoneNumber,
          trainingTime: this.studentData.trainingTime || this.studentData.TrainingTime || null,
          trainingGovernorateId: this.studentData.trainingGovernorateId || this.studentData.TrainingGovernorateId || null,
          recommendTrack: this.studentData.recommendTrack || this.studentData.RecommendTrack || null,
          recommendJobProfile: this.studentData.recommendJobProfile || this.studentData.RecommendJobProfile || null,
          graduationStatus: this.studentData.graduationStatus || this.studentData.GraduationStatus || null,
          track: this.studentData.track || this.studentData.Track || null,
          profileCode: this.studentData.profileCode || this.studentData.ProfileCode || null,
          academyClaseDetailsId: this.studentData.academyClaseDetailsId || this.studentData.AcademyClaseDetailsId || null,
          studentGroupId: this.studentData.studentGroupId || this.studentData.StudentGroupId || null,
          projectsDetailsId: this.studentData.projectsDetailsId || this.studentData.ProjectsDetailsId || null,
          trainingProvider: this.studentData.trainingProvider || this.studentData.TrainingProvider || 'Academy System',
          linkedIn: linkedInUrl || null,
          facebook: facebookUrl || null,
          language: this.studentData.language || this.studentData.Language || 'ar',
          certificateName: this.studentData.certificateName || this.studentData.CertificateName || null,
          studentMobil: phoneNumber,
          studentWhatsapp: this.studentData.studentWhatsapp || this.studentData.StudentWhatsapp || null,
          studentEmail: this.studentData.studentEmail || this.studentData.StudentEmail || this.user?.email || this.user?.Email || null,
          emailAcademy: this.studentData.emailAcademy || this.studentData.EmailAcademy || null,
          emailPassword: this.studentData.emailPassword || this.studentData.EmailPassword || null
        };
        
        // Debug: Log the payload being sent
        console.log('Updating student data with payload:', payload);
        
        this.studentData = await this.api.updateStudentData(id, payload as any).toPromise();
        // Update localStorage and trigger header update
        this.updateLocalStorage();
      } else {
        // Create new student record
        const fullName = this.user?.fullName || `${this.user?.firstName || ''} ${this.user?.lastName || ''}`.trim() || 'User';
        const createPayload = {
          studentNameL1: fullName,
          studentNameL2: fullName,
          studentAddress: 'N/A',
          studentPhone: phoneNumber,
          studentEmail: this.user?.email || this.user?.Email,
          linkedIn: linkedInUrl || null,
          facebook: facebookUrl || null,
          academyDataId: this.selectedAcademy && this.isValidUUID(this.selectedAcademy) ? this.selectedAcademy : null,
          branchesDataId: this.selectedBranch && this.isValidUUID(this.selectedBranch) ? this.selectedBranch : null,
          language: 'ar',
          trainingProvider: 'Academy System',
          studentMobil: phoneNumber,
          studentWhatsapp: null,
          countryCodeId: null,
          governorateCodeId: null,
          cityCodeId: null,
          trainingTime: null,
          trainingGovernorateId: null,
          recommendTrack: null,
          recommendJobProfile: null,
          graduationStatus: null,
          track: null,
          profileCode: null,
          academyClaseDetailsId: null,
          studentGroupId: null,
          projectsDetailsId: null,
          certificateName: null,
          emailAcademy: null,
          emailPassword: null,
          studentCode: null,
          studentBarCode: null
        };
        
        // Debug: Log the payload being sent
        console.log('Creating student data with payload:', createPayload);
        
        this.studentData = await this.api.createStudentData(createPayload).toPromise();
        // Update localStorage and trigger header update
        this.updateLocalStorage();
      }
    });
  }

  private ensurePhone(p: string): string {
    let v = (p || '').trim();
    if (!v || v.length < 7) v = this.user?.phoneNumber || this.user?.PhoneNumber || '1234567';
    if (v.length > 12) v = v.slice(0, 12);
    return v;
  }

  private updateLocalStorage(): void {
    try {
      if (this.studentData) {
        // Update studentData in localStorage
        const studentDataToStore = {
          ...this.studentData,
          userEmail: this.user?.email || this.user?.Email || ''
        };
        localStorage.setItem('studentData', JSON.stringify(studentDataToStore));
        
        // Update userSocialMedia in localStorage
        const socialDataToStore = {
          userEmail: this.user?.email || this.user?.Email || '',
          academyDataId: this.studentData.academyDataId || this.studentData.AcademyDataId || '',
          branchesDataId: this.studentData.branchesDataId || this.studentData.BranchesDataId || '',
          linkedIn: this.studentData.linkedIn || this.studentData.LinkedIn || '',
          facebook: this.studentData.facebook || this.studentData.Facebook || ''
        };
        localStorage.setItem('userSocialMedia', JSON.stringify(socialDataToStore));
        
        // Trigger custom event to update header
        window.dispatchEvent(new CustomEvent('student-data-changed'));
      }
    } catch (error) {
      console.warn('Failed to update localStorage:', error);
    }
  }

  async reloadAcademyAndBranches(): Promise<void> {
    await this.loadAcademyAndBranches();
  }

  getBranchesForAcademy(academyId: string): any[] {
    if (!academyId) return [];
    return this.branches.filter(branch => 
      branch.academyDataId === academyId || branch.AcademyDataId === academyId
    );
  }

  getAcademyName(academyId: string): string {
    console.log('Getting academy name for ID:', academyId);
    console.log('Available academies:', this.academies);
    
    const academy = this.academies.find(a => a.id === academyId);
    const result = academy ? (academy.academyNameL1 || academy.AcademyNameL1 || academy.academyNameL2 || academy.AcademyNameL2 || academy.name || academy.id) : academyId;
    
    console.log('Academy name result:', result);
    return result;
  }

  getBranchName(branchId: string): string {
    const branch = this.branches.find(b => b.id === branchId);
    return branch ? (branch.branchNameL1 || branch.BranchNameL1 || branch.branchNameL2 || branch.BranchNameL2 || branch.name || branch.id) : branchId;
  }

  hasValidAcademyData(): boolean {
    if (!this.studentData) return false;
    const academyId = this.studentData.academyDataId || this.studentData.AcademyDataId || '';
    
    // Debug logging
    console.log('Checking academy data validity:', {
      academyId,
      isGggg: academyId === 'gggg',
      isDddd: academyId === 'dddd',
      length: academyId.length,
      isValidUUID: this.isValidUUID(academyId),
      academiesCount: this.academies.length,
      existsInAcademies: this.academies.some(a => a.id === academyId)
    });
    
    // Check if academy ID exists and is a valid UUID (not placeholder values)
    const isValid = academyId && 
           academyId !== 'gggg' && 
           academyId !== 'dddd' && 
           academyId.length > 3 &&
           this.isValidUUID(academyId) &&
           this.academies.some(a => a.id === academyId);
    
    console.log('Academy data is valid:', isValid);
    return isValid;
  }

  hasValidBranchData(): boolean {
    if (!this.studentData) return false;
    const branchId = this.studentData.branchesDataId || this.studentData.BranchesDataId || '';
    
    // Debug logging
    console.log('Checking branch data validity:', {
      branchId,
      isGggg: branchId === 'gggg',
      isDddd: branchId === 'dddd',
      length: branchId.length,
      isValidUUID: this.isValidUUID(branchId),
      branchesCount: this.branches.length,
      existsInBranches: this.branches.some(b => b.id === branchId)
    });
    
    // Check if branch ID exists and is a valid UUID (not placeholder values)
    const isValid = branchId && 
           branchId !== 'gggg' && 
           branchId !== 'dddd' && 
           branchId.length > 3 &&
           this.isValidUUID(branchId) &&
           this.branches.some(b => b.id === branchId);
    
    console.log('Branch data is valid:', isValid);
    return isValid;
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'SupportAgent':
        return this.isRtl ? 'وكيل الدعم' : 'Support Agent';
      case 'Admin':
        return this.isRtl ? 'مدير النظام' : 'System Admin';
      case 'Instructor':
        return this.isRtl ? 'مدرس' : 'Instructor';
      case 'Student':
        return this.isRtl ? 'طالب' : 'Student';
      case 'User':
        return this.isRtl ? 'مستخدم' : 'User';
      default:
        return role || 'User';
    }
  }

  getEffectiveRole(u: any): string {
    if (!u) return 'User';
    const email = (u.email || u.Email || '').toLowerCase();
    const baseRole = u.role || u.Role || 'User';
    if (baseRole === 'SupportAgent' || baseRole === 'Admin' || baseRole === 'admin') return 'Admin';
    if (email === 'yjmt469999@gmail.com' || email === 'yjmt4699999@gmail.com') return 'Admin';
    return baseRole;
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'SupportAgent':
      case 'Admin':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'Instructor':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'Student':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
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
      const id = this.userId; 
      if (!id) throw new Error(this.isRtl ? 'لا يوجد معرف المستخدم' : 'No user ID');
      await this.api.accountEnable2fa(id).toPromise();
      this.twoFactorEnabled = true;
    });
  }

  async disable2FA(): Promise<void> {
    await this.withBusy('2fa', async () => {
      const id = this.userId; 
      if (!id) throw new Error(this.isRtl ? 'لا يوجد معرف المستخدم' : 'No user ID');
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
      console.error(`Error in ${name}:`, e);
      let msg = this.isRtl ? 'فشلت العملية' : 'Operation failed';
      
      try {
        if (e?.error) {
          // Handle HTTP error response
          const errorData = e.error;
          if (typeof errorData === 'string') {
            try {
              const parsedError = JSON.parse(errorData);
              msg = parsedError?.detail || parsedError?.title || parsedError?.message || parsedError?.Message || msg;
            } catch {
              msg = errorData;
            }
          } else if (typeof errorData === 'object') {
            msg = errorData?.detail || errorData?.title || errorData?.message || errorData?.Message || msg;
          }
        } else if (e?.body) {
          const errorData = JSON.parse(e.body);
          msg = errorData?.detail || errorData?.title || errorData?.message || e?.message || msg;
        } else {
          msg = e?.message || msg;
        }
      } catch (parseError) {
        msg = e?.message || msg;
      }
      
      // Add more specific error messages for common issues
      if (e?.status === 400) {
        msg = this.isRtl ? 'بيانات غير صحيحة. يرجى التحقق من جميع الحقول المطلوبة.' : 'Invalid data. Please check all required fields.';
      } else if (e?.status === 401) {
        msg = this.isRtl ? 'غير مصرح لك بهذه العملية. يرجى تسجيل الدخول مرة أخرى.' : 'Unauthorized. Please log in again.';
      } else if (e?.status === 404) {
        msg = this.isRtl ? 'البيانات المطلوبة غير موجودة.' : 'Requested data not found.';
      } else if (e?.status === 500) {
        msg = this.isRtl ? 'خطأ في الخادم. يرجى المحاولة لاحقاً.' : 'Server error. Please try again later.';
      }
      
      this.error = this.isRtl ? `خطأ: ${msg}` : `Error: ${msg}`;
    } finally {
      this.busyAction = '';
    }
  }
}