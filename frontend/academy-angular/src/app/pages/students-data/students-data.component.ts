import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';

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
  originalStudentData: any = null;

  // Lookups
  academies: any[] = [];
  branches: any[] = [];
  groups: any[] = [];

  // Form fields - Basic
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

  // Additional student fields - exactly like React version
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

  // Display flags like React version
  showIdFields = false;
  showCodeFields = false;

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private api: ApiService,
    private lang: LanguageService
  ) {}

  ngOnInit(): void {
    this.isRtl = this.lang.current === 'ar';
    this.loadInitialData();
  }

  async loadInitialData(): Promise<void> {
    try {
      this.loadingData = true;
      
      // Load groups, branches, and academies like React version
      const [groupsRes, branchesRes, academiesRes] = await Promise.all([
        this.api.getStudentGroup().toPromise().catch(() => []),
        this.api.getBranchesData().toPromise().catch(() => []),
        this.api.getAcademyData().toPromise().catch(() => [])
      ]);
      
      this.groups = Array.isArray(groupsRes) ? groupsRes : [];
      this.branches = Array.isArray(branchesRes) ? branchesRes : [];
      this.academies = Array.isArray(academiesRes) ? academiesRes : [];
      
      // Check if we're in edit mode
      this.route.queryParams.subscribe(params => {
        const editId = params.id;
        const isViewMode = params.view === 'true';
        
        console.log('URL parameters:', {
          editId,
          isViewMode,
          search: window.location.search
        });
        
        if (editId) {
          this.isEditMode = true;
          this.studentId = editId;
          this.loadStudentData();
        } else {
          this.loadingData = false;
        }
      });
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }

  async loadStudentData(): Promise<void> {
    if (!this.studentId) { 
      this.loadingData = false; 
      return; 
    }
    
    this.loading = true;
    this.error = null;
    
    try {
      console.log('Loading student data for ID:', this.studentId);
      // Load existing student data
      const studentData = await this.api.getStudentDataById(String(this.studentId)).toPromise();
      console.log('Student data received:', studentData);
      console.log('Student data keys:', Object.keys(studentData));
      
      if (studentData) {
        // Store original data for comparison
        this.originalStudentData = studentData;
        
        // Parse the full name into first and last name
        const fullName = studentData.StudentNameL1 || studentData.studentNameL1 || studentData.fullName || studentData.name || studentData.studentName || '';
        console.log('Full name:', fullName);
        const nameParts = fullName.split(' ');
        const first = nameParts[0] || '';
        const last = nameParts.slice(1).join(' ') || '';
        
        // Try multiple possible field names for each property
        const email = studentData.Email || studentData.email || studentData.studentEmail || studentData.StudentEmail || studentData.emailAddress || studentData.EmailAddress || studentData.userEmail || studentData.UserEmail || studentData.mail || studentData.Mail || '';
        const phone = studentData.StudentPhone || studentData.phoneNumber || studentData.phone || studentData.studentPhone || studentData.StudentPhone || studentData.telephone || studentData.Telephone || '';
        const address = studentData.StudentAddress || studentData.address || studentData.studentAddress || studentData.StudentAddress || studentData.location || studentData.Location || '';
        const groupId = studentData.StudentGroupId || studentData.groupId || studentData.studentGroupId || studentData.StudentGroupId || '';
        const branchId = studentData.BranchesDataId || studentData.branchId || studentData.branchesDataId || studentData.BranchesDataId || '';
        const academyId = studentData.AcademyDataId || studentData.academyId || studentData.academyDataId || studentData.AcademyDataId || '';
        
        console.log('Setting form data:', {
          firstName: first,
          lastName: last,
          email,
          phone,
          address,
          groupId,
          branchId,
          academyId
        });
        
        this.firstName = first;
        this.lastName = last;
        this.email = email;
        this.phoneNumber = phone;
        this.address = address;
        this.groupId = groupId;
        this.branchId = branchId;
        this.academyId = academyId;

        // Set additional fields if present
        this.studentCode = String(studentData.studentCode || studentData.StudentCode || '');
        this.studentBarCode = studentData.studentBarCode || studentData.StudentBarCode || '';
        this.studentNameL1 = studentData.studentNameL1 || studentData.StudentNameL1 || '';
        this.studentNameL2 = studentData.studentNameL2 || studentData.StudentNameL2 || '';
        this.countryCodeId = studentData.countryCodeId || studentData.CountryCodeId || '';
        this.governorateCodeId = studentData.governorateCodeId || studentData.GovernorateCodeId || '';
        this.cityCodeId = studentData.cityCodeId || studentData.CityCodeId || '';
        this.trainingTime = (studentData.trainingTime || studentData.TrainingTime || '').replace('Z', '');
        this.trainingGovernorateId = studentData.trainingGovernorateId || studentData.TrainingGovernorateId || '';
        this.recommendTrack = String(studentData.recommendTrack || studentData.RecommendTrack || '');
        this.recommendJobProfile = studentData.recommendJobProfile || studentData.RecommendJobProfile || '';
        this.graduationStatus = studentData.graduationStatus || studentData.GraduationStatus || '';
        this.track = studentData.track || studentData.Track || '';
        this.profileCode = String(studentData.profileCode || studentData.ProfileCode || '');
        this.academyClaseDetailsId = studentData.academyClaseDetailsId || studentData.AcademyClaseDetailsId || '';
        this.projectsDetailsId = studentData.projectsDetailsId || studentData.ProjectsDetailsId || '';
        this.trainingProvider = studentData.trainingProvider || studentData.TrainingProvider || '';
        this.linkedIn = studentData.linkedIn || studentData.LinkedIn || '';
        this.facebook = studentData.facebook || studentData.Facebook || '';
        this.language = studentData.language || studentData.Language || '';
        this.certificateName = studentData.certificateName || studentData.CertificateName || '';
        this.studentMobil = studentData.studentMobil || studentData.StudentMobil || '';
        this.studentWhatsapp = studentData.studentWhatsapp || studentData.StudentWhatsapp || '';
        this.studentEmail = studentData.studentEmail || studentData.StudentEmail || '';
        this.emailAcademy = studentData.emailAcademy || studentData.EmailAcademy || '';
        this.emailPassword = studentData.emailPassword || studentData.EmailPassword || '';
      } else {
        console.log('No student data received');
      }
    } catch (error) {
      console.error('Error loading student data:', error);
      console.error('Error details:', {
        message: (error as any)?.message,
        status: (error as any)?.status,
        body: (error as any)?.body
      });
      this.error = this.isRtl ? 'خطأ في تحميل بيانات الطالب' : 'Error loading student data';
    } finally {
      this.loading = false;
      this.loadingData = false;
    }
  }

  // Method to filter phone number input to only allow digits
  onPhoneNumberInput(event: any): void {
    this.phoneNumber = event.target.value.replace(/\D/g, '');
  }

  // Method to filter student mobile input to only allow digits
  onStudentMobilInput(event: any): void {
    this.studentMobil = event.target.value.replace(/\D/g, '');
  }

  // Method to filter student whatsapp input to only allow digits
  onStudentWhatsappInput(event: any): void {
    this.studentWhatsapp = event.target.value.replace(/\D/g, '');
  }

  async onSubmit(e?: Event): Promise<void> {
    if (e) e.preventDefault();
    this.loading = true;
    try {
      // Basic validations for registration
      if (!this.firstName.trim() || !this.lastName.trim()) {
        this.error = this.isRtl ? 'الاسم الأول واسم العائلة مطلوبان' : 'First and last name are required';
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        this.error = this.isRtl ? 'البريد الإلكتروني غير صحيح' : 'Invalid email';
        return;
      }
      if (!this.academyId || !this.branchId) {
        this.error = this.isRtl ? 'يرجى اختيار الأكاديمية والفرع' : 'Please select academy and branch';
        return;
      }
      if (!this.password || this.password.length < 6) {
        this.error = this.isRtl ? 'الرقم السري يجب أن يكون 6 أحرف على الأقل' : 'Password must be at least 6 characters';
        return;
      }
      if (this.password !== this.confirmPassword) {
        this.error = this.isRtl ? 'تأكيد الرقم السري لا يطابق' : 'Passwords do not match';
        return;
      }

      // Additional validation
      if (!this.phoneNumber || this.phoneNumber.length < 7) {
        this.error = this.isRtl ? 'رقم الهاتف يجب أن يكون 7 أرقام على الأقل' : 'Phone number must be at least 7 digits';
        return;
      }

      const payload = {
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

      console.log('Registration payload:', payload);
      const res = await this.api.accountRegister(payload).toPromise();
      console.log('Registration successful:', res);
      this.error = null; // Clear any previous errors
      
      // Show success message
      this.error = this.isRtl ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!';
      setTimeout(() => {
        this.error = null;
      }, 3000);
      
      // Create StudentData entry in backend so the student appears in /students
      try {
        const studentPayload = {
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
        await this.api.createStudentData(studentPayload).toPromise();
        // Notify other pages to refresh
        try { window.dispatchEvent(new Event('students-changed')); } catch (_) {}
      } catch (_) {}
      
      // Optional: attempt to send email confirmation and phone code
      try { 
        await this.api.resendEmailConfirmation({ email: payload.email }).toPromise(); 
        console.log('Email confirmation sent successfully');
      } catch (emailErr) {
        // Silently handle optional email confirmation failure
        console.log('Email confirmation not available (optional feature)');
      }
      try { 
        if (payload.phoneNumber) {
          await this.api.sendPhoneCode(payload.phoneNumber).toPromise();
          console.log('Phone code sent successfully');
        }
      } catch (phoneErr) {
        // Silently handle optional phone code failure
        console.log('Phone code sending not available (optional feature)');
      }
      
      // Clear form after successful registration
      this.firstName = '';
      this.lastName = '';
      this.email = '';
      this.phoneNumber = '';
      this.address = '';
      this.password = '';
      this.confirmPassword = '';
      this.branchId = '';
      this.academyId = '';

      this.studentCode = '';
      this.studentBarCode = '';
      this.studentNameL1 = '';
      this.studentNameL2 = '';
      this.countryCodeId = '';
      this.governorateCodeId = '';
      this.cityCodeId = '';
      this.trainingTime = '';
      this.trainingGovernorateId = '';
      this.recommendTrack = '';
      this.recommendJobProfile = '';
      this.graduationStatus = '';
      this.track = '';
      this.profileCode = '';
      this.academyClaseDetailsId = '';
      this.projectsDetailsId = '';
      this.trainingProvider = '';
      this.linkedIn = '';
      this.facebook = '';
      this.language = '';
      this.certificateName = '';
      this.studentMobil = '';
      this.studentWhatsapp = '';
      this.studentEmail = '';
      this.emailAcademy = '';
      this.emailPassword = '';
    } catch (err: any) {
      console.error('Registration error:', err);
      let msg = this.isRtl ? 'تعذر الحفظ' : 'Save failed';
      try { 
        const errorBody = JSON.parse(err?.error || err?.body || '{}');
        console.error('Error body:', errorBody);
        msg = errorBody.detail || errorBody.title || errorBody.message || msg; 
      } catch (parseErr) {
        console.error('Error parsing response:', parseErr);
        msg = err?.message || err?.statusText || msg;
      }
      this.error = msg;
    } finally {
      this.loading = false;
    }
  }
}

