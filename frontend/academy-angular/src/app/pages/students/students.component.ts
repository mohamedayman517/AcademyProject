import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit {
  loading = false;
  error: string | null = null;
  view: 'grid' | 'list' = 'grid';
  categories = ['جميع الطلاب','نشط','غير نشط','معلق'];
  selectedCategory = 'جميع الطلاب';
  query = '';
  students: any[] = [];
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

  get total(): number { return this.filteredStudents.length; }
  get totalPages(): number { return Math.max(1, Math.ceil(this.total / this.pageSize)); }

  get filteredStudents() {
    let list = [...this.students];
    if (this.selectedCategory !== 'جميع الطلاب') {
      list = list.filter(s => (s.status || '').includes(this.selectedCategory));
    }
    if (this.query.trim()) {
      const q = this.query.trim();
      list = list.filter(s =>
        (s.name || '').toLowerCase().includes(q.toLowerCase()) ||
        (s.email || '').toLowerCase().includes(q.toLowerCase()) ||
        (s.phone || '').includes(q)
      );
    }
    return list;
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
    
    this.route.queryParams.subscribe(params => {
      this.query = params.q || params.search || '';
      if (params.category) {
        const categoryMap: { [key: string]: string } = {
          'active': 'نشط',
          'inactive': 'غير نشط',
          'suspended': 'معلق'
        };
        this.selectedCategory = categoryMap[params.category] || 'جميع الطلاب';
      }
    });
    this.fetchStudents();
    this.loadReferenceData();
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
    
    // Mock data for students - replace with actual API call
    this.students = [
      {
        id: '1',
        name: 'أحمد محمد علي',
        email: 'ahmed@example.com',
        phone: '01234567890',
        academyId: '1',
        branchId: '1',
        status: 'نشط',
        joinDate: '2024-01-15',
        lastLogin: '2024-01-20'
      },
      {
        id: '2',
        name: 'فاطمة أحمد حسن',
        email: 'fatima@example.com',
        phone: '01234567891',
        academyId: '1',
        branchId: '2',
        status: 'نشط',
        joinDate: '2024-01-10',
        lastLogin: '2024-01-19'
      },
      {
        id: '3',
        name: 'محمد سعد الدين',
        email: 'mohamed@example.com',
        phone: '01234567892',
        academyId: '2',
        branchId: '1',
        status: 'غير نشط',
        joinDate: '2023-12-20',
        lastLogin: '2024-01-05'
      }
    ];
    
    console.log(`Students loaded: ${this.students.length}`, this.students);
    this.loading = false;
    this.page = 1;
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

    // Mock add student - replace with actual API call
    const newStudent = {
      id: Date.now().toString(),
      name: `${this.newStudent.firstName.trim()} ${this.newStudent.lastName.trim()}`,
      email: this.newStudent.email.trim(),
      phone: this.newStudent.phone.trim(),
      academyId: this.newStudent.academyId,
      branchId: this.newStudent.branchId,
      status: this.newStudent.status,
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: null
    };

    this.students.unshift(newStudent);
    this.showAddForm = false;
    this.resetForm();
    this.loading = false;
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

    // Mock update student - replace with actual API call
    const studentIndex = this.students.findIndex(s => s.id === this.editingStudent.id);
    if (studentIndex !== -1) {
      this.students[studentIndex] = {
        ...this.students[studentIndex],
        name: `${this.newStudent.firstName.trim()} ${this.newStudent.lastName.trim()}`,
        email: this.newStudent.email.trim(),
        phone: this.newStudent.phone.trim(),
        academyId: this.newStudent.academyId,
        branchId: this.newStudent.branchId,
        status: this.newStudent.status
      };
    }

    this.showEditForm = false;
    this.editingStudent = null;
    this.resetForm();
    this.loading = false;
  }

  deleteStudent(student: any) {
    if (!confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
      return;
    }

    this.loading = true;
    this.error = null;

    // Mock delete student - replace with actual API call
    const studentIndex = this.students.findIndex(s => s.id === student.id);
    if (studentIndex !== -1) {
      this.students.splice(studentIndex, 1);
    }

    this.loading = false;
  }

  cancelForm() {
    this.showAddForm = false;
    this.showEditForm = false;
    this.editingStudent = null;
    this.resetForm();
    this.error = null;
  }
}
