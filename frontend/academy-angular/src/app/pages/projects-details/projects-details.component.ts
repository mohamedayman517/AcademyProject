import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-projects-details',
  templateUrl: './projects-details.component.html',
  styleUrls: ['./projects-details.component.css']
})
export class ProjectsDetailsComponent implements OnInit {
  loading = false;
  error: string | null = null;
  view: 'grid' | 'list' = 'grid';
  categories = ['جميع المشاريع','التكنولوجيا','الأعمال','التصميم','اللغات','تطوير الذات'];
  selectedCategory = 'جميع المشاريع';
  query = '';
  projects: any[] = [];
  // pagination
  page = 1;
  pageSize = 12;
  
  // Admin functionality
  isAdmin$: Observable<boolean>;
  showAddForm = false;
  showEditForm = false;
  editingProject: any = null;
  
  // Reference data
  academies: any[] = [];
  branches: any[] = [];
  programsContentMaster: any[] = [];
  
  // Form data
  newProject = {
    programsContentMasterId: '',
    projectNameL1: '',
    projectNameL2: '',
    projectDescription: ''
  };

  get total(): number { return this.filteredProjects.length; }
  get totalPages(): number { return Math.max(1, Math.ceil(this.total / this.pageSize)); }

  get filteredProjects() {
    let list = [...this.projects];
    if (this.selectedCategory !== 'جميع المشاريع') {
      list = list.filter(p => (p.category || '').includes(this.selectedCategory));
    }
    if (this.query.trim()) {
      const q = this.query.trim();
      list = list.filter(p =>
        (p.title || '').toLowerCase().includes(q.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(q.toLowerCase())
      );
    }
    return list;
  }

  get pagedProjects() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredProjects.slice(start, start + this.pageSize);
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
        this.selectedCategory = categoryMap[params.category] || 'جميع المشاريع';
      }
    });
    this.fetchProjects();
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

  fetchProjects(): void {
    this.loading = true;
    this.error = null;
    
    // Use ProgramsContentMaster as projects data
    this.api.getProgramsContentMaster().subscribe({
      next: (data) => {
        console.log('Projects API response:', data);
        const dataArr = Array.isArray(data) ? data : (data?.items || data?.data || []);
        
        this.projects = dataArr.map((item: any) => ({
          id: item.id || item.Id || item.masterId || item.uid,
          title: item.sessionNameL1 || item.SessionNameL1 || 'مشروع بدون عنوان',
          description: item.description || item.Description || '',
          durationWeeks: 0,
          students: 0,
          price: 0,
          rating: 0,
          level: 'غير محدد',
          category: 'مشاريع',
          imageUrl: item.imageUrl || item.ImageUrl || null,
          academyId: item.academyDataId || item.AcademyDataId || null,
          branchId: item.branchCodeId || item.BranchCodeId || null,
          programsContentMasterId: item.id || item.Id || item.masterId || item.uid,
          projectNameL2: item.sessionNameL2 || item.SessionNameL2 || '',
          sessionNo: item.sessionNo || item.SessionNo || 0
        }));
        
        console.log(`Projects loaded: ${this.projects.length}`, this.projects);
        this.loading = false;
        this.page = 1;
      },
      error: (err) => {
        console.error('Error loading projects:', err);
        this.error = 'فشل في تحميل المشاريع';
        this.loading = false;
      }
    });
  }

  getProjectImage(project: any): string {
    if (project?.imageUrl) return project.imageUrl;
    
    const id = project?.id || project?.Id;
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
  showAddProjectForm() {
    this.showAddForm = true;
    this.showEditForm = false;
    this.resetForm();
    this.loadReferenceData();
  }

  showEditProjectForm(project: any) {
    this.editingProject = project;
    this.showEditForm = true;
    this.showAddForm = false;
    this.loadReferenceData();
    this.newProject = {
      programsContentMasterId: project.programsContentMasterId || '',
      projectNameL1: project.title || '',
      projectNameL2: project.projectNameL2 || '',
      projectDescription: project.description || ''
    };
  }

  resetForm() {
    this.newProject = {
      programsContentMasterId: '',
      projectNameL1: '',
      projectNameL2: '',
      projectDescription: ''
    };
  }

  addProject() {
    if (!this.newProject.projectNameL1.trim()) {
      this.error = 'يرجى إدخال اسم المشروع بالعربية';
      return;
    }

    if (this.newProject.projectNameL1.trim().length < 3 || this.newProject.projectNameL1.trim().length > 70) {
      this.error = 'اسم المشروع بالعربية يجب أن يكون بين 3 و 70 حرف';
      return;
    }

    if (!this.newProject.programsContentMasterId || this.newProject.programsContentMasterId.trim() === '') {
      this.error = 'يرجى اختيار البرنامج الرئيسي';
      return;
    }

    if (this.programsContentMaster.length === 0) {
      this.error = 'لا توجد برامج رئيسية متاحة. يرجى المحاولة لاحقاً.';
      return;
    }

    this.loading = true;
    this.error = null;

    const masterPayload: any = {
      SessionNameL1: this.newProject.projectNameL1.trim(),
      SessionNameL2: this.newProject.projectNameL2.trim() || undefined,
      Description: this.newProject.projectDescription.trim() || undefined
    };

    this.api.createProgramsContentMaster(masterPayload).subscribe({
      next: (response) => {
        console.log('Project created successfully:', response);
        this.showAddForm = false;
        this.resetForm();
        this.fetchProjects();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error adding project:', err);
        if (err.status === 400) {
          this.error = 'بيانات المشروع غير صحيحة. يرجى التحقق من جميع الحقول المطلوبة.';
        } else if (err.status === 401) {
          this.error = 'غير مخول لإضافة مشاريع. يرجى تسجيل الدخول كمدير.';
        } else if (err.status === 403) {
          this.error = 'ليس لديك صلاحية لإضافة مشاريع.';
        } else if (err.status === 500) {
          this.error = 'خطأ في الخادم. يرجى المحاولة لاحقاً.';
        } else {
          this.error = `حدث خطأ أثناء إضافة المشروع: ${err.statusText || 'خطأ غير معروف'}`;
        }
        this.loading = false;
      }
    });
  }

  updateProject() {
    if (!this.newProject.projectNameL1.trim()) {
      this.error = 'يرجى إدخال اسم المشروع بالعربية';
      return;
    }

    if (this.newProject.projectNameL1.trim().length < 3 || this.newProject.projectNameL1.trim().length > 70) {
      this.error = 'اسم المشروع بالعربية يجب أن يكون بين 3 و 70 حرف';
      return;
    }

    if (!this.newProject.programsContentMasterId.trim()) {
      this.error = 'يرجى اختيار البرنامج الرئيسي';
      return;
    }

    if (this.programsContentMaster.length === 0) {
      this.error = 'لا توجد برامج رئيسية متاحة. يرجى المحاولة لاحقاً.';
      return;
    }

    this.loading = true;
    this.error = null;

    const cleaned: any = {
      SessionNameL1: this.newProject.projectNameL1.trim()
    };
    if (this.newProject.projectNameL2 && this.newProject.projectNameL2.trim()) {
      cleaned.SessionNameL2 = this.newProject.projectNameL2.trim();
    }
    if (this.newProject.projectDescription && this.newProject.projectDescription.trim()) {
      cleaned.Description = this.newProject.projectDescription.trim();
    }

    const targetId = this.editingProject.programsContentMasterId || this.editingProject.id;

    this.api.updateProgramsContentMaster(targetId, cleaned).subscribe({
      next: (response) => {
        console.log('Project updated successfully:', response);
        this.showEditForm = false;
        this.editingProject = null;
        this.resetForm();
        this.fetchProjects();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error updating project:', err);
        if (err.status === 400) {
          this.error = 'بيانات المشروع غير صحيحة. يرجى التحقق من جميع الحقول المطلوبة.';
        } else if (err.status === 401) {
          this.error = 'غير مخول لتحديث المشاريع. يرجى تسجيل الدخول كمدير.';
        } else if (err.status === 403) {
          this.error = 'ليس لديك صلاحية لتحديث المشاريع.';
        } else if (err.status === 404) {
          this.error = 'المشروع غير موجود.';
        } else if (err.status === 500) {
          this.error = 'خطأ في الخادم. يرجى المحاولة لاحقاً.';
        } else {
          this.error = `حدث خطأ أثناء تحديث المشروع: ${err.statusText || 'خطأ غير معروف'}`;
        }
        this.loading = false;
      }
    });
  }

  deleteProject(project: any) {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
      return;
    }

    this.loading = true;
    this.error = null;

    const projectId = project.id || project.Id || project.detailId || project.uid;
    if (!projectId) {
      this.error = 'معرف المشروع غير صحيح';
      this.loading = false;
      return;
    }

    this.api.deleteProgramsContentMaster(projectId).subscribe({
      next: () => {
        this.fetchProjects();
      },
      error: (err) => {
        console.error('Error deleting project:', err);
        this.error = 'حدث خطأ أثناء حذف المشروع';
        this.loading = false;
      }
    });
  }

  cancelForm() {
    this.showAddForm = false;
    this.showEditForm = false;
    this.editingProject = null;
    this.resetForm();
    this.error = null;
  }
}
