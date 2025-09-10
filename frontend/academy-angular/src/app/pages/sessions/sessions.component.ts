import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.css']
})
export class SessionsComponent implements OnInit {
  loading = false;
  error: string | null = null;
  view: 'grid' | 'list' = 'grid';
  categories = ['جميع الجلسات','التكنولوجيا','الأعمال','التصميم','اللغات','تطوير الذات'];
  selectedCategory = 'جميع الجلسات';
  query = '';
  sessions: any[] = [];
  // pagination
  page = 1;
  pageSize = 12;
  
  // Admin functionality
  isAdmin$: Observable<boolean>;
  showAddForm = false;
  showEditForm = false;
  editingSession: any = null;
  
  // Reference data
  academies: any[] = [];
  branches: any[] = [];
  programsContentMaster: any[] = [];
  
  // Form data
  newSession = {
    programsContentMasterId: '',
    sessionNameL1: '',
    sessionNameL2: '',
    sessionDescription: '',
    sessionNo: 0
  };

  get total(): number { return this.filteredSessions.length; }
  get totalPages(): number { return Math.max(1, Math.ceil(this.total / this.pageSize)); }

  get filteredSessions() {
    let list = [...this.sessions];
    if (this.selectedCategory !== 'جميع الجلسات') {
      list = list.filter(s => (s.category || '').includes(this.selectedCategory));
    }
    if (this.query.trim()) {
      const q = this.query.trim();
      list = list.filter(s =>
        (s.title || '').toLowerCase().includes(q.toLowerCase()) ||
        (s.description || '').toLowerCase().includes(q.toLowerCase())
      );
    }
    return list;
  }

  get pagedSessions() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredSessions.slice(start, start + this.pageSize);
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
          'tech': 'التكنولوجيا',
          'business': 'الأعمال',
          'design': 'التصميم',
          'language': 'اللغات',
          'skills': 'تطوير الذات'
        };
        this.selectedCategory = categoryMap[params.category] || 'جميع الجلسات';
      }
    });
    this.fetchSessions();
    this.loadReferenceData();
  }

  loadReferenceData(): void {
    console.log('Loading reference data...');
    
    this.api.getProgramsContentMaster().subscribe({
      next: (data) => {
        console.log('ProgramsContentMaster API response:', data);
        this.programsContentMaster = Array.isArray(data) ? data : (data?.items || data?.data || []);
        console.log('ProgramsContentMaster loaded:', this.programsContentMaster.length);
      },
      error: (err) => {
        console.error('Error loading ProgramsContentMaster:', err);
        this.programsContentMaster = [];
      }
    });
    
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

  fetchSessions(): void {
    this.loading = true;
    this.error = null;
    
    // Use ProgramsContentMaster as sessions data
    this.api.getProgramsContentMaster().subscribe({
      next: (data) => {
        console.log('Sessions API response:', data);
        const dataArr = Array.isArray(data) ? data : (data?.items || data?.data || []);
        
        this.sessions = dataArr.map((item: any) => ({
          id: item.id || item.Id || item.masterId || item.uid,
          title: item.sessionNameL1 || item.SessionNameL1 || 'جلسة بدون عنوان',
          description: item.description || item.Description || '',
          durationWeeks: 0,
          students: 0,
          price: 0,
          rating: 0,
          level: 'غير محدد',
          category: 'جلسات',
          imageUrl: item.imageUrl || item.ImageUrl || null,
          academyId: item.academyDataId || item.AcademyDataId || null,
          branchId: item.branchCodeId || item.BranchCodeId || null,
          programsContentMasterId: item.id || item.Id || item.masterId || item.uid,
          sessionNameL2: item.sessionNameL2 || item.SessionNameL2 || '',
          sessionNo: item.sessionNo || item.SessionNo || 0
        }));
        
        console.log(`Sessions loaded: ${this.sessions.length}`, this.sessions);
        this.loading = false;
        this.page = 1;
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
        this.error = 'فشل في تحميل الجلسات';
        this.loading = false;
      }
    });
  }

  getSessionImage(session: any): string {
    if (session?.imageUrl) return session.imageUrl;
    
    const id = session?.id || session?.Id;
    if (id) {
      return `${environment.apiBaseUrl}/api/ProgramsContentMaster/${id}/image`;
    }
    
    return 'assets/images/program_placeholder-BXZ7ZM7h.png';
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

  getProgramsContentMasterName(masterId: string): string {
    if (!masterId || !this.programsContentMaster || this.programsContentMaster.length === 0) {
      return 'برنامج غير معروف';
    }
    
    const master = this.programsContentMaster.find(m => 
      m.id === masterId || 
      m.Id === masterId || 
      String(m.id) === String(masterId) || 
      String(m.Id) === String(masterId)
    );
    
    if (master) {
      return master.sessionNameL1 || master.SessionNameL1 || master.title || master.Title || 'برنامج غير معروف';
    }
    
    return 'برنامج غير معروف';
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
  showAddSessionForm() {
    this.showAddForm = true;
    this.showEditForm = false;
    this.resetForm();
    this.loadReferenceData();
  }

  showEditSessionForm(session: any) {
    this.editingSession = session;
    this.showEditForm = true;
    this.showAddForm = false;
    this.loadReferenceData();
    this.newSession = {
      programsContentMasterId: session.programsContentMasterId || '',
      sessionNameL1: session.title || '',
      sessionNameL2: session.sessionNameL2 || '',
      sessionDescription: session.description || '',
      sessionNo: session.sessionNo || 0
    };
  }

  resetForm() {
    this.newSession = {
      programsContentMasterId: '',
      sessionNameL1: '',
      sessionNameL2: '',
      sessionDescription: '',
      sessionNo: 0
    };
  }

  addSession() {
    if (!this.newSession.sessionNameL1.trim()) {
      this.error = 'يرجى إدخال اسم الجلسة بالعربية';
      return;
    }

    if (this.newSession.sessionNameL1.trim().length < 3 || this.newSession.sessionNameL1.trim().length > 70) {
      this.error = 'اسم الجلسة بالعربية يجب أن يكون بين 3 و 70 حرف';
      return;
    }

    this.loading = true;
    this.error = null;

    const masterPayload: any = {
      SessionNameL1: this.newSession.sessionNameL1.trim(),
      SessionNameL2: this.newSession.sessionNameL2.trim() || undefined,
      Description: this.newSession.sessionDescription.trim() || undefined,
      SessionNo: this.newSession.sessionNo || 0
    };

    this.api.createProgramsContentMaster(masterPayload).subscribe({
      next: (response) => {
        console.log('Session created successfully:', response);
        this.showAddForm = false;
        this.resetForm();
        this.fetchSessions();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error adding session:', err);
        if (err.status === 400) {
          this.error = 'بيانات الجلسة غير صحيحة. يرجى التحقق من جميع الحقول المطلوبة.';
        } else if (err.status === 401) {
          this.error = 'غير مخول لإضافة جلسات. يرجى تسجيل الدخول كمدير.';
        } else if (err.status === 403) {
          this.error = 'ليس لديك صلاحية لإضافة جلسات.';
        } else if (err.status === 500) {
          this.error = 'خطأ في الخادم. يرجى المحاولة لاحقاً.';
        } else {
          this.error = `حدث خطأ أثناء إضافة الجلسة: ${err.statusText || 'خطأ غير معروف'}`;
        }
        this.loading = false;
      }
    });
  }

  updateSession() {
    if (!this.newSession.sessionNameL1.trim()) {
      this.error = 'يرجى إدخال اسم الجلسة بالعربية';
      return;
    }

    if (this.newSession.sessionNameL1.trim().length < 3 || this.newSession.sessionNameL1.trim().length > 70) {
      this.error = 'اسم الجلسة بالعربية يجب أن يكون بين 3 و 70 حرف';
      return;
    }

    this.loading = true;
    this.error = null;

    const cleaned: any = {
      SessionNameL1: this.newSession.sessionNameL1.trim(),
      SessionNo: this.newSession.sessionNo || 0
    };
    if (this.newSession.sessionNameL2 && this.newSession.sessionNameL2.trim()) {
      cleaned.SessionNameL2 = this.newSession.sessionNameL2.trim();
    }
    if (this.newSession.sessionDescription && this.newSession.sessionDescription.trim()) {
      cleaned.Description = this.newSession.sessionDescription.trim();
    }

    const targetId = this.editingSession.programsContentMasterId || this.editingSession.id;

    this.api.updateProgramsContentMaster(targetId, cleaned).subscribe({
      next: (response) => {
        console.log('Session updated successfully:', response);
        this.showEditForm = false;
        this.editingSession = null;
        this.resetForm();
        this.fetchSessions();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error updating session:', err);
        if (err.status === 400) {
          this.error = 'بيانات الجلسة غير صحيحة. يرجى التحقق من جميع الحقول المطلوبة.';
        } else if (err.status === 401) {
          this.error = 'غير مخول لتحديث الجلسات. يرجى تسجيل الدخول كمدير.';
        } else if (err.status === 403) {
          this.error = 'ليس لديك صلاحية لتحديث الجلسات.';
        } else if (err.status === 404) {
          this.error = 'الجلسة غير موجودة.';
        } else if (err.status === 500) {
          this.error = 'خطأ في الخادم. يرجى المحاولة لاحقاً.';
        } else {
          this.error = `حدث خطأ أثناء تحديث الجلسة: ${err.statusText || 'خطأ غير معروف'}`;
        }
        this.loading = false;
      }
    });
  }

  deleteSession(session: any) {
    if (!confirm('هل أنت متأكد من حذف هذه الجلسة؟')) {
      return;
    }

    this.loading = true;
    this.error = null;

    const sessionId = session.id || session.Id || session.detailId || session.uid;
    if (!sessionId) {
      this.error = 'معرف الجلسة غير صحيح';
      this.loading = false;
      return;
    }

    this.api.deleteProgramsContentMaster(sessionId).subscribe({
      next: () => {
        this.fetchSessions();
      },
      error: (err) => {
        console.error('Error deleting session:', err);
        this.error = 'حدث خطأ أثناء حذف الجلسة';
        this.loading = false;
      }
    });
  }

  cancelForm() {
    this.showAddForm = false;
    this.showEditForm = false;
    this.editingSession = null;
    this.resetForm();
    this.error = null;
  }
}
