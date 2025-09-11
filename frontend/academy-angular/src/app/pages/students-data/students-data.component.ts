import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-students-data',
  templateUrl: './students-data.component.html',
  styleUrls: ['./students-data.component.css']
})
export class StudentsDataComponent implements OnInit {
  // UI/state
  loading = false;
  loadingData = true;
  error: string | null = null;
  isRtl = false;
  isEditMode = false;
  viewMode = false;
  studentId: string | null = null;

  // Lookups
  academies: any[] = [];
  branches: any[] = [];

  // Form fields
  firstName = '';
  lastName = '';
  email = '';
  phoneNumber = '';
  address = '';
  password = '';
  confirmPassword = '';
  groupId = '';
  branchId = '';
  academyId = '';

  // Additional fields
  studentCode: string = '';
  studentBarCode = '';
  studentNameL1 = '';
  studentNameL2 = '';
  countryCodeId = '';
  governorateCodeId = '';
  cityCodeId = '';
  trainingTime = '';
  trainingGovernorateId = '';
  recommendTrack: string = '';
  recommendJobProfile = '';
  graduationStatus = '';
  track = '';
  profileCode: string = '';
  academyClaseDetailsId = '';
  projectsDetailsId = '';
  trainingProvider = '';
  linkedIn = '';
  facebook = '';
  language = '';
  certificateName = '';
  studentMobil = '';
  studentWhatsapp = '';
  studentEmail = '';
  emailAcademy = '';
  emailPassword = '';

  constructor(private route: ActivatedRoute, private router: Router, private api: ApiService) {}

  ngOnInit(): void {
    // direction
    try { this.isRtl = (localStorage.getItem('lang') || 'en') === 'ar'; } catch {}

    this.route.queryParams.subscribe(async params => {
      this.studentId = params.id || null;
      this.viewMode = String(params.view) === 'true';
      this.isEditMode = !!this.studentId;
      await this.loadLookups();
      if (this.studentId) {
        await this.loadStudentData();
      } else {
        this.loadingData = false;
      }
    });
  }

  async loadLookups(): Promise<void> {
    try {
      this.loadingData = true;
      const [acRes, brRes] = await Promise.all([
        this.api.getAcademyData().toPromise().catch(() => []),
        this.api.getBranchesData().toPromise().catch(() => [])
      ]);
      this.academies = Array.isArray(acRes) ? acRes : [];
      this.branches = Array.isArray(brRes) ? brRes : [];
    } finally {
      // keep loadingData controlled by loadStudentData if editing
    }
  }

  async loadStudentData(): Promise<void> {
    if (!this.studentId) { this.loadingData = false; return; }
    this.loading = true;
    this.error = null;
    try {
      const s: any = await this.api.getStudentDataById(String(this.studentId)).toPromise();
      if (s) {
        const fullName = s.StudentNameL1 || s.studentNameL1 || s.fullName || s.name || s.studentName || '';
        const parts = String(fullName).trim().split(' ');
        const first = parts[0] || '';
        const last = parts.slice(1).join(' ') || '';

        const email = s.Email || s.email || s.studentEmail || s.StudentEmail || s.emailAddress || s.EmailAddress || s.userEmail || s.UserEmail || s.mail || s.Mail || '';
        const phone = s.StudentPhone || s.phoneNumber || s.phone || s.studentPhone || s.Telephone || '';
        const address = s.StudentAddress || s.address || s.studentAddress || s.Location || '';
        const groupId = s.StudentGroupId || s.groupId || s.studentGroupId || '';
        const branchId = s.BranchesDataId || s.branchId || s.branchesDataId || s.BranchDataId || '';
        const academyId = s.AcademyDataId || s.academyId || s.academyDataId || '';

        this.firstName = first;
        this.lastName = last;
        this.email = email;
        this.phoneNumber = String(phone);
        this.address = String(address);
        this.groupId = String(groupId);
        this.branchId = String(branchId);
        this.academyId = String(academyId);

        this.studentCode = String(s.studentCode || s.StudentCode || '');
        this.studentBarCode = s.studentBarCode || s.StudentBarCode || '';
        this.studentNameL1 = s.studentNameL1 || s.StudentNameL1 || '';
        this.studentNameL2 = s.studentNameL2 || s.StudentNameL2 || '';
        this.countryCodeId = s.countryCodeId || s.CountryCodeId || '';
        this.governorateCodeId = s.governorateCodeId || s.GovernorateCodeId || '';
        this.cityCodeId = s.cityCodeId || s.CityCodeId || '';
        this.trainingTime = (s.trainingTime || s.TrainingTime || '').replace('Z', '');
        this.trainingGovernorateId = s.trainingGovernorateId || s.TrainingGovernorateId || '';
        this.recommendTrack = String(s.recommendTrack || s.RecommendTrack || '');
        this.recommendJobProfile = s.recommendJobProfile || s.RecommendJobProfile || '';
        this.graduationStatus = s.graduationStatus || s.GraduationStatus || '';
        this.track = s.track || s.Track || '';
        this.profileCode = String(s.profileCode || s.ProfileCode || '');
        this.academyClaseDetailsId = s.academyClaseDetailsId || s.AcademyClaseDetailsId || '';
        this.projectsDetailsId = s.projectsDetailsId || s.ProjectsDetailsId || '';
        this.trainingProvider = s.trainingProvider || s.TrainingProvider || '';
        this.linkedIn = s.linkedIn || s.LinkedIn || '';
        this.facebook = s.facebook || s.Facebook || '';
        this.language = s.language || s.Language || '';
        this.certificateName = s.certificateName || s.CertificateName || '';
        this.studentMobil = s.studentMobil || s.StudentMobil || '';
        this.studentWhatsapp = s.studentWhatsapp || s.StudentWhatsapp || '';
        this.studentEmail = s.studentEmail || s.StudentEmail || '';
        this.emailAcademy = s.emailAcademy || s.EmailAcademy || '';
        this.emailPassword = s.emailPassword || s.EmailPassword || '';
      }
    } catch (e) {
      this.error = this.isRtl ? 'خطأ في تحميل بيانات الطالب' : 'Error loading student data';
    } finally {
      this.loading = false;
      this.loadingData = false;
    }
  }

  async onSubmit(e?: Event): Promise<void> {
    if (e) e.preventDefault();
    this.loading = true;
    try {
      if (!this.firstName.trim() || !this.lastName.trim()) {
        throw new Error(this.isRtl ? 'الاسم الأول واسم العائلة مطلوبان' : 'First and last name are required');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        throw new Error(this.isRtl ? 'البريد الإلكتروني غير صحيح' : 'Invalid email');
      }
      if (!this.academyId || !this.branchId) {
        throw new Error(this.isRtl ? 'يرجى اختيار الأكاديمية والفرع' : 'Please select academy and branch');
      }

      // Register account if creating new
      if (!this.isEditMode) {
        if (!this.password || this.password.length < 6) {
          throw new Error(this.isRtl ? 'الرقم السري يجب أن يكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
        }
        if (this.password !== this.confirmPassword) {
          throw new Error(this.isRtl ? 'تأكيد الرقم السري لا يطابق' : 'Passwords do not match');
        }
        const accountPayload = {
          firstName: this.firstName.trim(),
          lastName: this.lastName.trim(),
          role: 'Student',
          academyDataId: this.academyId,
          branchesDataId: this.branchId,
          email: this.email.trim(),
          phoneNumber: this.phoneNumber.trim(),
          password: this.password,
          confirmPassword: this.confirmPassword
        };
        await this.api.accountRegister(accountPayload as any).toPromise();
        try { await this.api.accountSendEmailConfirmation({ email: accountPayload.email }).toPromise(); } catch {}
        try { if (accountPayload.phoneNumber) await this.api.accountSendPhoneCode({ phoneNumber: accountPayload.phoneNumber }).toPromise(); } catch {}
      }

      // Create StudentData entry
      try {
        const studentPayload: any = {
          AcademyDataId: this.academyId,
          BranchesDataId: this.branchId,
          StudentNameL1: `${this.firstName} ${this.lastName}`.trim(),
          StudentNameL2: `${this.firstName} ${this.lastName}`.trim(),
          StudentAddress: (this.address || '').trim() || 'N/A',
          StudentPhone: this.phoneNumber && this.phoneNumber.length >= 7 ? this.phoneNumber : '01000000000',
          StudentMobil: this.phoneNumber && this.phoneNumber.length >= 7 ? this.phoneNumber : '01000000000',
          StudentWhatsapp: this.phoneNumber && this.phoneNumber.length >= 7 ? this.phoneNumber : '01000000000',
          StudentEmail: this.email,
        };
        if (this.isEditMode && this.studentId) {
          await this.api.updateStudentData(String(this.studentId), studentPayload).toPromise();
        } else {
          await this.api.createStudentData(studentPayload).toPromise();
        }
        try { window.dispatchEvent(new Event('students-changed')); } catch {}
      } catch {}

      // Reset or navigate
      if (this.isEditMode) {
        this.router.navigate(['/students']);
      } else {
        this.firstName = this.lastName = this.email = this.phoneNumber = this.address = '';
        this.password = this.confirmPassword = '';
        this.branchId = this.academyId = '';
      }
      this.error = null;
    } catch (err: any) {
      let msg = this.isRtl ? 'تعذر الحفظ' : 'Save failed';
      try {
        const errorBody = JSON.parse(err?.body || '{}');
        msg = errorBody.detail || errorBody.title || msg;
      } catch {}
      this.error = msg;
    } finally {
      this.loading = false;
    }
  }
}

