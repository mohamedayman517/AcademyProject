import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { combineLatest, Subscription } from 'rxjs';

@Component({
  selector: 'app-projects-details',
  templateUrl: './projects-details.component.html',
  styleUrls: ['./projects-details.component.css']
})
export class ProjectsDetailsComponent implements OnInit, OnDestroy {
  // Loading and error state
  loading = false;
  error: string | null = null;

  // Data rows
  rows: any[] = [];
  usingDefaultData = false;

  // Admin + modal form
  isAdmin = false;
  isFormOpen = false;
  isSubmitting = false;
  selectedRow: any = null;

  // Subscriptions
  private subs: Subscription[] = [];

  // References
  projectsMaster: any[] = [];

  // URL filters
  academyId: string | null = null;
  branchId: string | null = null;

  // Form model
  formModel: any = {
    ProjectsMasterId: '',
    ProjectNameL1: '',
    ProjectNameL2: '',
    Description: ''
  };

  // Default fallback data (shown when backend returns empty or fails)
  private readonly defaultRows = [
    { id: 1, projectsMasterId: 1, projectNameL1: 'واجهة المستخدم الأمامية', projectNameL2: 'Frontend User Interface', description: 'تطوير واجهة مستخدم تفاعلية باستخدام Angular' },
    { id: 2, projectsMasterId: 1, projectNameL1: 'الخادم الخلفي', projectNameL2: 'Backend Server', description: 'تطوير API باستخدام .NET' },
    { id: 3, projectsMasterId: 2, projectNameL1: 'واجهة التطبيق', projectNameL2: 'App Interface', description: 'تصميم واجهة مستخدم للتطبيق المحمول' }
  ];

  constructor(private api: ApiService, private router: Router, private route: ActivatedRoute, private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.useDevToken();
    // Align admin detection with Jobs page using AuthService streams
    const s = combineLatest([this.auth.isAuthenticated$, this.auth.roles$]).subscribe(([isAuth, roles]) => {
      const normalized = (roles || []).map(r => String(r).toLowerCase());
      const isAdminRole = normalized.some(r => ['admin', 'administrator', 'superadmin', 'supportagent'].includes(r));
      this.isAdmin = !!isAuth && isAdminRole;
    });
    this.subs.push(s);

    this.route.queryParams.subscribe(params => {
      this.academyId = params['academy'] ?? null;
      this.branchId = params['branch'] ?? null;
      this.loadAll();
    });

    // Initial references load
    this.loadProjectsMaster();
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  private loadAll(): void {
    this.loading = true;
    this.error = null;
    this.api.getProjectsDetail().subscribe({
      next: async (data) => {
        const details = Array.isArray(data) ? data : (data?.items || data?.data || []);
        if (!details || details.length === 0) {
          this.rows = this.defaultRows;
          this.usingDefaultData = true;
          this.loading = false;
          return;
        }

        let filtered = details;
        if (this.academyId && this.branchId) {
          try {
            const masters = await this.api.getProjectsMaster().toPromise();
            const mastersArr = Array.isArray(masters) ? masters : (masters?.items || masters?.data || []);
            const filteredMasters = mastersArr.filter((m: any) => {
              const a = m.academyDataId || m.AcademyDataId || m.academyId || m.AcademyId;
              const b = m.branchesDataId || m.BranchesDataId || m.branchId || m.BranchId;
              return String(a) === String(this.academyId) && String(b) === String(this.branchId);
            });
            filtered = details.filter((d: any) => {
              const mid = d.projectsMasterId || d.ProjectsMasterId;
              return filteredMasters.some((m: any) => (m.id || m.Id) === mid);
            });
          } catch (e) {
            // If filtering fails, fall back to all details
          }
        }

        this.rows = filtered;
        this.usingDefaultData = false;
        this.loading = false;
      },
      error: () => {
        this.rows = this.defaultRows;
        this.usingDefaultData = true;
        this.loading = false;
        this.error = 'فشل تحميل البيانات - عرض بيانات افتراضية';
      }
    });
  }

  private loadProjectsMaster(): void {
    this.api.getProjectsMaster().subscribe({
      next: (data) => {
        this.projectsMaster = Array.isArray(data) ? data : (data?.items || data?.data || []);
        console.log('Projects master loaded:', this.projectsMaster);
        
        if (this.projectsMaster.length === 0) {
          this.error = 'لا توجد مشاريع رئيسية متاحة - يرجى إضافة مشروع رئيسي أولاً';
        }
      },
      error: (err) => {
        console.error('Error loading projects master:', err);
        this.projectsMaster = [];
        this.error = 'فشل في تحميل قائمة المشاريع الرئيسية';
      }
    });
  }

  getMasterName(masterId: any): string {
    const m = this.projectsMaster.find(pm => (pm.id || pm.Id) === masterId);
    if (!m) return String(masterId ?? '');
    return m.ProjectNameL1 || m.projectNameL1 || m.ProjectNameL2 || m.projectNameL2 || m.name || String(masterId);
  }

  openCreateForm(): void {
    this.selectedRow = null;
    this.formModel = { ProjectsMasterId: '', ProjectNameL1: '', ProjectNameL2: '', Description: '' };
    this.isFormOpen = true;
  }

  openEditForm(row: any): void {
    console.log('Editing row:', row);
    this.selectedRow = row;
    
    // Ensure we have a valid ProjectsMasterId
    const projectsMasterId = row.projectsMasterId || row.ProjectsMasterId || '';
    if (!projectsMasterId) {
      this.error = 'لا يمكن تعديل هذا السجل - معرف المشروع الرئيسي مفقود';
      return;
    }
    
    this.formModel = {
      ProjectsMasterId: projectsMasterId,
      ProjectNameL1: row.projectNameL1 || row.ProjectNameL1 || '',
      ProjectNameL2: row.projectNameL2 || row.ProjectNameL2 || '',
      Description: row.description || row.Description || ''
    };
    console.log('Form model set to:', this.formModel);
    this.isFormOpen = true;
  }

  closeForm(): void {
    this.isFormOpen = false;
    this.selectedRow = null;
    this.error = null;
  }

  save(): void {
    // basic validate
    const nameAr = (this.formModel.ProjectNameL1 || '').trim();
    if (!nameAr || nameAr.length < 3 || nameAr.length > 70) {
      this.error = 'اسم المشروع بالعربية يجب أن يكون بين 3 و 70 حرف';
      return;
    }
    if (!this.formModel.ProjectsMasterId) {
      this.error = 'يرجى اختيار المشروع الرئيسي';
      return;
    }

    // clean and prepare data - ensure all required fields are present
    const cleaned: any = {
      ProjectsMasterId: this.formModel.ProjectsMasterId,
      ProjectNameL1: this.formModel.ProjectNameL1?.trim() || '',
      ProjectNameL2: this.formModel.ProjectNameL2?.trim() || '',
      Description: this.formModel.Description?.trim() || ''
    };

    // Remove any undefined or null values that might cause issues
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === undefined) {
        delete cleaned[key];
      }
    });

    // Ensure ProjectsMasterId is a valid string
    if (!cleaned.ProjectsMasterId || cleaned.ProjectsMasterId === '') {
      this.error = 'يرجى اختيار المشروع الرئيسي';
      return;
    }

    // Convert ProjectsMasterId to string if it's a number
    cleaned.ProjectsMasterId = String(cleaned.ProjectsMasterId);
    
    // Validate GUID format for ProjectsMasterId
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!guidRegex.test(cleaned.ProjectsMasterId)) {
      this.error = 'معرف المشروع الرئيسي غير صحيح - يجب أن يكون GUID صحيح';
      return;
    }

    // Validate that ProjectsMasterId exists in the projects master list
    const masterExists = this.projectsMaster.some(master => 
      (master.id || master.Id) === cleaned.ProjectsMasterId
    );
    if (!masterExists) {
      this.error = 'المشروع الرئيسي المحدد غير موجود في قائمة المشاريع';
      return;
    }

    // Convert empty strings to null for optional fields only
    if (cleaned.ProjectNameL2 === '') {
      cleaned.ProjectNameL2 = null;
    }
    if (cleaned.Description === '') {
      cleaned.Description = null;
    }

    // Ensure ProjectNameL1 is not empty
    if (!cleaned.ProjectNameL1 || cleaned.ProjectNameL1.trim() === '') {
      this.error = 'اسم المشروع بالعربية مطلوب';
      return;
    }

    // Final validation - ensure all required fields are present and valid
    const requiredFields = ['ProjectsMasterId', 'ProjectNameL1'];
    const missingFields = requiredFields.filter(field => !cleaned[field] || cleaned[field].trim() === '');
    
    if (missingFields.length > 0) {
      this.error = `الحقول التالية مطلوبة: ${missingFields.join(', ')}`;
      return;
    }

    console.log('Sending data:', cleaned);
    console.log('Selected row:', this.selectedRow);
    console.log('ProjectsMasterId type:', typeof cleaned.ProjectsMasterId);
    console.log('ProjectsMasterId value:', cleaned.ProjectsMasterId);
    console.log('Available projects master:', this.projectsMaster.map(p => ({ id: p.id || p.Id, name: p.ProjectNameL1 || p.projectNameL1 })));
    
    // Additional validation
    if (!cleaned.ProjectNameL1 || cleaned.ProjectNameL1.length < 3) {
      this.error = 'اسم المشروع بالعربية يجب أن يكون 3 أحرف على الأقل';
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    // IMPORTANT: Pass plain object; ApiService will construct FormData internally
    const op$ = this.selectedRow
      ? this.api.updateProjectsDetail(this.selectedRow.id || this.selectedRow.Id, cleaned)
      : this.api.createProjectsDetail(cleaned);

    op$.subscribe({
      next: (response) => {
        console.log('Success response:', response);
        this.isFormOpen = false;
        this.selectedRow = null;
        this.isSubmitting = false;
        this.error = null;
        this.loadAll();
        alert('تم حفظ البيانات بنجاح');
      },
      error: (error) => {
        console.error('Error response:', error);
        console.error('Error details:', error?.error);
        this.isSubmitting = false;
        
        let errorMessage = 'حدث خطأ أثناء حفظ تفاصيل المشروع';
        
        if (error?.error?.message) {
          errorMessage += `: ${error.error.message}`;
        } else if (error?.error?.title) {
          errorMessage += `: ${error.error.title}`;
        } else if (error?.error?.errors) {
          // Handle validation errors
          const validationErrors = error.error.errors;
          const errorDetails = Object.keys(validationErrors).map(key => 
            `${key}: ${validationErrors[key].join(', ')}`
          ).join('; ');
          errorMessage += `: ${errorDetails}`;
        } else if (error?.message) {
          errorMessage += `: ${error.message}`;
        } else if (error?.status === 500) {
          errorMessage += ': خطأ في الخادم (500) - يرجى التحقق من البيانات المرسلة';
          console.log('Data sent:', cleaned);
          console.log('FormData keys and values:');
          Object.keys(cleaned).forEach(key => {
            console.log(`${key}:`, cleaned[key]);
          });
        } else if (error?.status === 400) {
          errorMessage += ': بيانات غير صحيحة (400) - يرجى التحقق من جميع الحقول المطلوبة';
          console.log('Data sent:', cleaned);
        } else if (error?.status === 404) {
          errorMessage += ': المشروع غير موجود (404)';
        }
        
        this.error = errorMessage;
        alert(errorMessage);
      }
    });
  }

  viewProject(row: any): void {
    const projectDetailId = row.id || row.Id;
    if (!projectDetailId) {
      alert('لا يمكن عرض المشروع - معرف تفاصيل المشروع مفقود');
      return;
    }

    // الانتقال إلى صفحة عرض تفاصيل المشروع
    this.router.navigate(['/project-details', projectDetailId]);
  }

  delete(row: any): void {
    if (!confirm('هل أنت متأكد من حذف تفاصيل هذا المشروع؟')) return;
    this.api.deleteProjectsDetail(row.id || row.Id).subscribe({
      next: () => this.loadAll(),
      error: () => alert('حدث خطأ في حذف تفاصيل المشروع')
    });
  }
}

