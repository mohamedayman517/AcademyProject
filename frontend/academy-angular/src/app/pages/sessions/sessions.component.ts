import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
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
  usingDefaultData = false;

  // Calendar state
  currentMonth = new Date();
  selectedDate: Date | null = null;
  today: Date = new Date();

  // Projects data mapped for calendar display
  projects: Array<{
    id: any;
    title: string;
    description: string;
    date: Date | null;
    startDate?: string | null;
    endDate?: string | null;
  }> = [];

  // Admin and dialog state
  isAdmin$: Observable<boolean>;
  isFormOpen = false;
  isSubmitting = false;
  selectedProject: any = null;
  formModel: { ProjectNameL1: string; ProjectNameL2?: string; Description?: string; ProjectStart: string; ProjectEnd?: string } = {
    ProjectNameL1: '',
    ProjectNameL2: '',
    Description: '',
    ProjectStart: '',
    ProjectEnd: ''
  };

  // Persisted map of projectId -> chosen date
  projectDatesMap: Record<string, string> = {};

  // URL filters
  academyId: string | null = null;
  branchId: string | null = null;

  constructor(private api: ApiService, private route: ActivatedRoute, private auth: AuthService) {
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

    // Restore persisted map
    try {
      const raw = localStorage.getItem('projectDatesMap');
      this.projectDatesMap = raw ? JSON.parse(raw) : {};
    } catch { this.projectDatesMap = {}; }

    // Read URL filters
    this.route.queryParams.subscribe(params => {
      this.academyId = params['academy'] || null;
      this.branchId = params['branch'] || null;
      this.fetchProjects();
    });
  }

  // ==== Calendar helpers ====
  goPrev(): void { this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1); }
  goNext(): void { this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1); }

  private extractDate(row: any): Date | null {
    const candidates = [row.date, row.sessionDate, row.startDate, row.ProjectStart, row.projectStart, row.createdAt, row.updatedAt].filter(Boolean);
    for (const c of candidates) {
      const d = new Date(c);
      if (!isNaN(d as unknown as number)) return d;
    }
    return null;
  }

  private persistProjectDate(projectId: any, dateStr: string) {
    if (!projectId || !dateStr) return;
    const key = String(projectId);
    this.projectDatesMap[key] = dateStr;
    try { localStorage.setItem('projectDatesMap', JSON.stringify(this.projectDatesMap)); } catch {}
  }

  // ==== Data loading (Projects Master) ====
  fetchProjects(): void {
    this.loading = true;
    this.error = null;

    this.api.getProjectsMaster().subscribe({
      next: (data) => {
        const rows = Array.isArray(data) ? data : (data?.items || data?.data || []);

        // Optional filtering by academy/branch from URL
        let filtered = rows;
        if (this.academyId || this.branchId) {
          filtered = rows.filter((p: any) => {
            const academy = p.academyDataId || p.AcademyDataId || p.academyId || p.AcademyId;
            const branch = p.branchesDataId || p.BranchesDataId || p.branchId || p.BranchId;
            const okA = this.academyId ? String(academy) === String(this.academyId) : true;
            const okB = this.branchId ? String(branch) === String(this.branchId) : true;
            return okA && okB;
          });
        }

        if (!filtered.length) {
          // Fallback demo data (20 projects like React page)
          const now = new Date();
          const demo: any[] = [];
          for (let i = 0; i < 20; i++) {
            const start = new Date(now);
            start.setDate(now.getDate() + (i * 7));
            const end = new Date(start);
            end.setDate(start.getDate() + 14);
            demo.push({
              id: i + 1,
              ProjectNameL1: 'مشروع',
              ProjectNameL2: 'Project',
              Description: 'وصف افتراضي للمشروع',
              ProjectStart: start.toISOString(),
              ProjectEnd: end.toISOString()
            });
          }
          filtered = demo;
          this.usingDefaultData = true;
        } else {
          this.usingDefaultData = false;
        }

        this.projects = filtered.map((r: any) => {
          const id = r.id || r.Id;
          const chosen = id && this.projectDatesMap[String(id)] ? new Date(this.projectDatesMap[String(id)]) : null;
          return {
            id,
            title: r.ProjectNameL1 || r.projectNameL1 || r.ProjectNameL2 || r.projectNameL2 || r.title || 'Project',
            description: r.Description || r.description || '',
            date: chosen || this.extractDate(r),
            startDate: r.ProjectStart || r.projectStart || null,
            endDate: r.ProjectEnd || r.projectEnd || null
          };
        });

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading projects:', err);
        this.error = 'فشل تحميل البيانات';
        this.loading = false;
      }
    });
  }

  // ==== Admin actions (create/update using ProjectsMaster) ====
  openCreateForm() {
    this.selectedProject = null;
    this.isFormOpen = true;
    this.formModel = {
      ProjectNameL1: '',
      ProjectNameL2: '',
      Description: '',
      ProjectStart: '',
      ProjectEnd: ''
    };
  }

  openEditForm(project: any) {
    this.selectedProject = project;
    this.isFormOpen = true;
    this.formModel = {
      ProjectNameL1: project?.ProjectNameL1 || project?.title || '',
      ProjectNameL2: project?.ProjectNameL2 || '',
      Description: project?.Description || project?.description || '',
      ProjectStart: project?.startDate ? String(project.startDate).slice(0,10) : '',
      ProjectEnd: project?.endDate ? String(project.endDate).slice(0,10) : ''
    };
  }

  cancelForm() {
    this.isFormOpen = false;
    this.selectedProject = null;
    this.formModel = {
      ProjectNameL1: '',
      ProjectNameL2: '',
      Description: '',
      ProjectStart: '',
      ProjectEnd: ''
    };
  }

  async saveProject(form: {
    ProjectNameL1: string;
    ProjectNameL2?: string;
    Description?: string;
    ProjectStart: string;
    ProjectEnd?: string;
    id?: any;
  }) {
    try {
      this.isSubmitting = true;
      if (!form.ProjectNameL1) throw new Error('الاسم العربي مطلوب');
      if (!form.ProjectStart) throw new Error('تاريخ البداية مطلوب');

      if (this.selectedProject && this.selectedProject.id) {
        await this.api.updateProjectsMaster(String(this.selectedProject.id), form).toPromise();
      } else {
        const created = await this.api.createProjectsMaster(form).toPromise();
        const newId = created?.id || created?.Id;
        if (newId && form.ProjectStart) this.persistProjectDate(newId, form.ProjectStart);
      }
      this.isFormOpen = false;
      this.selectedProject = null;
      this.fetchProjects();
    } catch (e: any) {
      this.error = e?.message || 'خطأ أثناء الحفظ';
    } finally {
      this.isSubmitting = false;
    }
  }
}

