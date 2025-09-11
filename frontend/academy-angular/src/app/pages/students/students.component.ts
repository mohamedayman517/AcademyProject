import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit, OnDestroy {
  loading = false;
  error: string | null = null;
  // UI/state
  view: 'grid' | 'list' = 'grid';
  query = '';

  // i18n and direction
  isRtl = false;
  langCode: 'ar' | 'en' = 'en';

  // data
  students: any[] = [];
  studentImages: Record<string, string> = {};

  // admin
  isAdmin = false;
  // pagination
  page = 1;
  pageSize = 12;
  
  // Admin functionality
  isAdmin$: Observable<boolean>;
  showAddForm = false;
  showEditForm = false;
  editingStudent: any = null;
  
  // Reference data
  academies: any[] = [];
  branches: any[] = [];
  
  // Form data
  newStudent = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    academyId: '',
    branchId: '',
    status: 'نشط'
  };

  private subs: Subscription[] = [];

  get total(): number { return this.filteredStudents.length; }
  get totalPages(): number { return Math.max(1, Math.ceil(this.total / this.pageSize)); }

  get filteredStudents() {
    const q = (this.query || '').trim().toLowerCase();
    if (!q) return this.students;
    return this.students.filter(s => {
      const values = [
        this.getName(s),
        this.getEmail(s),
        this.getPhone(s)
      ].filter(Boolean).map(v => String(v).toLowerCase());
      return values.some(v => v.includes(q));
    });
  }

  get pagedStudents() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredStudents.slice(start, start + this.pageSize);
  }

  constructor(private api: ApiService, private router: Router, private route: ActivatedRoute, private auth: AuthService) {
    this.isAdmin$ = this.auth.roles$.pipe(
      map(roles => {
        const roleArray = roles || [];
        return roleArray.some(r => r.toLowerCase().includes('admin')) || 
               roleArray.some(r => r.toLowerCase().includes('administrator')) || 
               roleArray.some(r => r.toLowerCase().includes('superadmin'));
      })
    );
  }

  ngOnInit(): void {
    this.auth.useDevToken();
    // language/dir
    try {
      const code = (localStorage.getItem('lang') || 'en') as 'ar' | 'en';
      this.langCode = code;
      this.isRtl = code === 'ar';
    } catch (_) {}

    // Admin detection like /jobs: react to auth streams
    const sub = combineLatest([this.auth.isAuthenticated$, this.auth.roles$]).subscribe(([isAuth, roles]) => {
      const normalized = (roles || []).map(r => String(r).toLowerCase());
      const isAdminRole = normalized.some(r => ['admin', 'administrator', 'superadmin', 'supportagent'].includes(r));
      this.isAdmin = !!isAuth && isAdminRole;
    });
    this.subs.push(sub);

    this.route.queryParams.subscribe(params => {
      this.query = params.q || params.search || '';
    });
    this.fetchStudents();
    this.loadReferenceData();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  loadReferenceData(): void {
    console.log('Loading reference data...');
    
    this.api.getAcademyData().subscribe({
      next: (data) => {
        console.log('Academies API response:', data);
        this.academies = Array.isArray(data) ? data : (data?.items || data?.data || []);
        console.log('Academies loaded:', this.academies.length);
      },
      error: (err) => {
        console.error('Error loading academies:', err);
        this.academies = [];
      }
    });

    this.api.getBranchesData().subscribe({
      next: (data) => {
        console.log('Branches API response:', data);
        this.branches = Array.isArray(data) ? data : (data?.items || data?.data || []);
        console.log('Branches loaded:', this.branches.length);
      },
      error: (err) => {
        console.error('Error loading branches:', err);
        this.branches = [];
      }
    });
  }

  fetchStudents(): void {
    this.loading = true;
    this.error = null;
    this.api.getStudents().subscribe({
      next: async (res) => {
        const list = Array.isArray(res) ? res : [];
        this.students = list;
        this.page = 1;
        await this.loadStudentImages(this.students);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading students', err);
        this.error = this.isRtl ? 'حدث خطأ أثناء تحميل الطلاب' : 'Failed to load students';
        this.students = [];
        this.loading = false;
      }
    });
  }

  getAcademyName(academyId: string): string {
    if (!academyId || !this.academies || this.academies.length === 0) {
      return 'أكاديمية غير معروفة';
    }
    
    const academy = this.academies.find(a => 
      a.id === academyId || 
      a.Id === academyId || 
      String(a.id) === String(academyId) || 
      String(a.Id) === String(academyId)
    );
    
    if (academy) {
      return academy.claseNameL1 || academy.ClaseNameL1 || academy.academyNameL1 || academy.AcademyNameL1 || academy.name || academy.Name || 'أكاديمية غير معروفة';
    }
    
    return 'أكاديمية غير معروفة';
  }

  getBranchName(branchId: string): string {
    if (!branchId || !this.branches || this.branches.length === 0) {
      return 'فرع غير معروف';
    }
    
    const branch = this.branches.find(b => 
      b.id === branchId || 
      b.Id === branchId || 
      String(b.id) === String(branchId) || 
      String(b.Id) === String(branchId)
    );
    
    if (branch) {
      return branch.branchNameL1 || branch.BranchNameL1 || branch.name || branch.Name || 'فرع غير معروف';
    }
    
    return 'فرع غير معروف';
  }

  onSearch(): void {
    const q = (this.query || '').trim();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: q || null },
      queryParamsHandling: 'merge'
    });
    this.page = 1;
  }

  nextPage() {
    if (this.page < this.totalPages) this.page += 1;
  }

  prevPage() {
    if (this.page > 1) this.page -= 1;
  }

  // Admin functions
  showAddStudentForm() {
    this.showAddForm = true;
    this.showEditForm = false;
    this.resetForm();
    this.loadReferenceData();
  }

  showEditStudentForm(student: any) {
    this.editingStudent = student;
    this.showEditForm = true;
    this.showAddForm = false;
    this.loadReferenceData();
    this.newStudent = {
      firstName: student.name?.split(' ')[0] || '',
      lastName: student.name?.split(' ').slice(1).join(' ') || '',
      email: student.email || '',
      phone: student.phone || '',
      academyId: student.academyId || '',
      branchId: student.branchId || '',
      status: student.status || 'نشط'
    };
  }

  resetForm() {
    this.newStudent = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      academyId: '',
      branchId: '',
      status: 'نشط'
    };
  }

  addStudent() {
    if (!this.newStudent.firstName.trim() || !this.newStudent.lastName.trim()) {
      this.error = 'يرجى إدخال الاسم الأول والأخير';
      return;
    }

    if (!this.newStudent.email.trim()) {
      this.error = 'يرجى إدخال البريد الإلكتروني';
      return;
    }

    if (!this.newStudent.academyId || !this.newStudent.branchId) {
      this.error = 'يرجى اختيار الأكاديمية والفرع';
      return;
    }

    this.loading = true;
    this.error = null;

    const payload: any = {
      FirstName: this.newStudent.firstName.trim(),
      LastName: this.newStudent.lastName.trim(),
      Email: this.newStudent.email.trim(),
      PhoneNumber: this.newStudent.phone.trim(),
      AcademyDataId: this.newStudent.academyId,
      BranchDataId: this.newStudent.branchId,
      Status: this.newStudent.status
    };

    this.api.createStudentData(payload).subscribe({
      next: () => {
        this.showAddForm = false;
        this.resetForm();
        this.fetchStudents();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error creating student', err);
        this.error = this.isRtl ? 'تعذر إضافة الطالب' : 'Failed to add student';
        this.loading = false;
      }
    });
  }

  updateStudent() {
    if (!this.newStudent.firstName.trim() || !this.newStudent.lastName.trim()) {
      this.error = 'يرجى إدخال الاسم الأول والأخير';
      return;
    }

    if (!this.newStudent.email.trim()) {
      this.error = 'يرجى إدخال البريد الإلكتروني';
      return;
    }

    if (!this.newStudent.academyId || !this.newStudent.branchId) {
      this.error = 'يرجى اختيار الأكاديمية والفرع';
      return;
    }

    this.loading = true;
    this.error = null;

    const payload: any = {
      FirstName: this.newStudent.firstName.trim(),
      LastName: this.newStudent.lastName.trim(),
      Email: this.newStudent.email.trim(),
      PhoneNumber: this.newStudent.phone.trim(),
      AcademyDataId: this.newStudent.academyId,
      BranchDataId: this.newStudent.branchId,
      Status: this.newStudent.status
    };

    this.api.updateStudentData(this.editingStudent.id || this.editingStudent.Id, payload).subscribe({
      next: () => {
        this.showEditForm = false;
        this.editingStudent = null;
        this.resetForm();
        this.fetchStudents();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error updating student', err);
        this.error = this.isRtl ? 'تعذر تعديل بيانات الطالب' : 'Failed to update student';
        this.loading = false;
      }
    });
  }

  deleteStudent(student: any) {
    if (!confirm(this.isRtl ? 'هل أنت متأكد من حذف هذا الطالب؟' : 'Are you sure you want to delete this student?')) {
      return;
    }

    this.loading = true;
    this.error = null;

    const id = student.id || student.Id;
    this.api.deleteStudentData(String(id)).subscribe({
      next: () => {
        this.students = this.students.filter(s => (s.id || s.Id) !== id);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error deleting student', err);
        this.error = this.isRtl ? 'تعذر حذف الطالب' : 'Failed to delete student';
        this.loading = false;
      }
    });
  }

  cancelForm() {
    this.showAddForm = false;
    this.showEditForm = false;
    this.editingStudent = null;
    this.resetForm();
    this.error = null;
  }

  // Helpers to align with React StudentsPage.jsx
  getName(s: any): string {
    const first = s.firstName || s.FirstName || '';
    const last = s.lastName || s.LastName || '';
    const full = s.fullName || s.studentNameL1 || s.StudentNameL1 || s.studentNameL2 || s.StudentNameL2 || `${first} ${last}`.trim();
    return full || (this.langCode === 'ar' ? 'طالب' : 'Student');
  }

  getEmail(s: any): string { return s.email || s.Email || ''; }
  getPhone(s: any): string { return s.phoneNumber || s.PhoneNumber || s.studentPhone || s.StudentPhone || s.phone || ''; }
  isActive(s: any): boolean {
    if (typeof s.active === 'boolean') return s.active;
    if (typeof s.Active === 'boolean') return s.Active;
    return (s.status || '').includes('نشط');
  }
  getId(s: any): string { return s.id || s.Id || s.guid || s.Guid || this.getName(s); }
  getImageUrl(s: any): string | undefined {
    const accountId = this.accountIdForImage(s);
    return accountId ? this.studentImages[accountId] : undefined;
  }

  accountIdForImage(s: any): string {
    const candidate = s.userId || s.UserId || s.id || s.Id || '';
    const str = String(candidate);
    const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return guidRegex.test(str) ? str : '';
  }

  async loadStudentImages(studentsList: any[]): Promise<void> {
    const images: Record<string, string> = {};
    for (const student of studentsList) {
      const accountId = this.accountIdForImage(student);
      if (!accountId) continue;
      try {
        const blob = await this.api.accountGetProfilePicture(accountId).toPromise();
        if (blob && (blob as any).size > 0) {
          const url = URL.createObjectURL(blob as any);
          images[accountId] = url;
        }
      } catch (_) {}
    }
    this.studentImages = images;
  }
}

