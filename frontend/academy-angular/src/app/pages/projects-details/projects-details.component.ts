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
      },
      error: () => {
        this.projectsMaster = [];
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
    this.selectedRow = row;
    this.formModel = {
      ProjectsMasterId: row.projectsMasterId || row.ProjectsMasterId || '',
      ProjectNameL1: row.projectNameL1 || row.ProjectNameL1 || '',
      ProjectNameL2: row.projectNameL2 || row.ProjectNameL2 || '',
      Description: row.description || row.Description || ''
    };
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

    // clean
    const cleaned: any = { ...this.formModel };
    Object.keys(cleaned).forEach(k => {
      if (cleaned[k] === '' || cleaned[k] === null || cleaned[k] === undefined) delete cleaned[k];
    });

    // when editing, do not send id fields in body
    if (this.selectedRow) {
      delete cleaned.id;
      delete cleaned.Id;
    }

    this.isSubmitting = true;
    const op$ = this.selectedRow
      ? this.api.updateProjectsDetail(this.selectedRow.id || this.selectedRow.Id, cleaned)
      : this.api.createProjectsDetail(cleaned);

    op$.subscribe({
      next: () => {
        this.isFormOpen = false;
        this.selectedRow = null;
        this.isSubmitting = false;
        this.loadAll();
      },
      error: () => {
        this.isSubmitting = false;
        this.error = 'حدث خطأ أثناء حفظ تفاصيل المشروع';
      }
    });
  }

  delete(row: any): void {
    if (!confirm('هل أنت متأكد من حذف تفاصيل هذا المشروع؟')) return;
    this.api.deleteProjectsDetail(row.id || row.Id).subscribe({
      next: () => this.loadAll(),
      error: () => alert('حدث خطأ في حذف تفاصيل المشروع')
    });
  }
}

