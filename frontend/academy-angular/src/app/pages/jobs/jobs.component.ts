import { Component, OnDestroy, OnInit } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { combineLatest, Subscription, firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface JobItem {
  id: string;
  jobNo: number;
  jobNameL1: string;
  jobNameL2: string;
  description: string;
  jobLink: string;
  category: string;
  experience: string;
  level: string;
  qualification: string;
  jobCategory: string;
  location: string;
  salary: string;
  type: string;
  postedDate: string;
  requirements?: string[];
}

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css']
})
export class JobsComponent implements OnInit, OnDestroy {
  loading = true;
  error: string | null = null;
  isRtl = false;
  isAdmin = false; // mirror UI; can be wired to roles later

  // data
  jobs: JobItem[] = [];
  selectedCategory = 'all';
  searchQuery = '';

  // categories with counts
  jobCategories = [
    { id: 'graphicDesigner', nameAr: 'مصمم جرافيك', nameEn: 'Graphic Designer', color: 'bg-purple-500', count: 0 },
    { id: 'networkEngineer', nameAr: 'مهندس شبكات', nameEn: 'Network Engineer', color: 'bg-blue-500', count: 0 },
    { id: 'webDesigner', nameAr: 'مصمم مواقع', nameEn: 'Web Designer', color: 'bg-green-500', count: 0 },
    { id: 'digitalMarketer', nameAr: 'مسوق رقمي', nameEn: 'Digital Marketer', color: 'bg-orange-500', count: 0 },
  ];

  private CATEGORY_LABELS = [
    { id: 'graphicDesigner', en: 'Graphic Designer', ar: 'مصمم جرافيك' },
    { id: 'networkEngineer', en: 'Network Engineer', ar: 'مهندس شبكات' },
    { id: 'webDesigner', en: 'Web Designer', ar: 'مصمم مواقع' },
    { id: 'digitalMarketer', en: 'Digital Marketer', ar: 'مسوق رقمي' },
  ];

  private allowedCategoryLabelsEn = ['Graphic Designer', 'Network Engineer', 'Web Designer', 'Digital Marketer'];

  private normalizeJobCategoryLabelToAllowed(input?: string): string {
    if (!input) return '';
    const txt = input.trim().toLowerCase();
    const hit = this.allowedCategoryLabelsEn.find(l => l.toLowerCase() === txt);
    if (hit) return hit;
    // fuzzy contains match
    const contains = this.allowedCategoryLabelsEn.find(l => txt.includes(l.split(' ')[0].toLowerCase()));
    return contains || '';
  }

  private getCategoryMap(): Record<string, string> {
    try {
      return JSON.parse(localStorage.getItem('academy_job_category_map') || '{}') || {};
    } catch {
      return {};
    }
  }

  private saveCategoryMap(map: Record<string, string>): void {
    try {
      localStorage.setItem('academy_job_category_map', JSON.stringify(map));
    } catch {}
  }

  private setJobCategoryMapping(jobId: string, categoryId: string): void {
    if (!jobId || !categoryId) return;
    const map = this.getCategoryMap();
    map[jobId] = categoryId;
    this.saveCategoryMap(map);
  }

  private deriveCategoryIdFromName(name?: string): string {
    if (!name) return '';
    const normalized = String(name).trim().toLowerCase();
    const hit = this.CATEGORY_LABELS.find(c => c.en.toLowerCase() === normalized || c.ar.toLowerCase() === normalized);
    return hit ? hit.id : '';
  }

  private labelFromCategoryId(id?: string): string {
    const hit = this.CATEGORY_LABELS.find(c => c.id === id);
    return this.isRtl ? (hit?.ar ?? '') : (hit?.en ?? '');
  }

  private subs: Subscription[] = [];
  constructor(private lang: LanguageService, private auth: AuthService, private api: ApiService) {}

  ngOnInit(): void {
    this.isRtl = this.lang.current === 'ar';
    // React to auth state and roles using AuthService streams
    const s = combineLatest([this.auth.isAuthenticated$, this.auth.roles$]).subscribe(([isAuth, roles]) => {
      const normalized = (roles || []).map(r => String(r).toLowerCase());
      const isAdminRole = normalized.some(r => ['admin', 'administrator', 'superadmin', 'supportagent'].includes(r));
      this.isAdmin = isAuth && isAdminRole;
    });
    this.subs.push(s);
    this.loadJobsData();
    this.loadLookups();
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  async loadJobsData(): Promise<void> {
    this.loading = true;
    this.error = null;
    const langAr = this.isRtl;
    const mockJobs: JobItem[] = [
      {
        id: '1',
        jobNo: 1001,
        jobNameL1: langAr ? 'مصمم جرافيك مبدع' : 'Creative Graphic Designer',
        jobNameL2: 'Creative Graphic Designer',
        description: langAr
          ? 'نبحث عن مصمم جرافيك مبدع لانضمامه لفريقنا التعليمي لتصميم المواد البصرية والهويات البصرية للمنصات التعليمية والمواد الإعلانية'
          : 'We are looking for a creative graphic designer to join our educational team to design visual materials and brand identities for educational platforms and advertising materials',
        jobLink: 'https://example.com/apply',
        category: 'graphicDesigner',
        experience: langAr ? 'من 2-4 سنوات' : '2-4 years',
        level: langAr ? 'متوسط' : 'Mid-level',
        qualification: langAr ? 'بكالوريوس تصميم جرافيك أو الفنون الجميلة' : 'Bachelor in Graphic Design or Fine Arts',
        jobCategory: langAr ? 'تصميم' : 'Design',
        location: langAr ? 'القاهرة، مصر' : 'Cairo, Egypt',
        salary: langAr ? '5000-8000 جنيه مصري' : '5000-8000 EGP',
        type: langAr ? 'دوام كامل' : 'Full-time',
        postedDate: langAr ? 'منذ 3 أيام' : '3 days ago',
        requirements: langAr ? [
          'خبرة في برامج Adobe Creative Suite',
          'مهارات في تصميم الهويات البصرية',
          'القدرة على العمل ضمن فريق',
          'الإبداع والاهتمام بالتفاصيل'
        ] : [
          'Experience with Adobe Creative Suite',
          'Skills in visual identity design',
          'Ability to work within a team',
          'Creativity and attention to detail'
        ]
      },
      {
        id: '2',
        jobNo: 1002,
        jobNameL1: langAr ? 'مهندس شبكات متقدم' : 'Senior Network Engineer',
        jobNameL2: 'Senior Network Engineer',
        description: langAr
          ? 'مهندس شبكات ذو خبرة لإدارة البنية التحتية للشبكات وتطويرها وضمان أمان وسرعة الاتصال'
          : 'Experienced network engineer to manage and develop network infrastructure and ensure security and connection speed',
        jobLink: 'https://example.com/apply',
        category: 'networkEngineer',
        experience: langAr ? 'من 5-7 سنوات' : '5-7 years',
        level: langAr ? 'متقدم' : 'Senior',
        qualification: langAr ? 'بكالوريوس هندسة حاسبات أو تقنية المعلومات' : 'Bachelor in Computer Engineering or IT',
        jobCategory: langAr ? 'تقنية' : 'Technology',
        location: langAr ? 'الإسكندرية، مصر' : 'Alexandria, Egypt',
        salary: langAr ? '8000-12000 جنيه مصري' : '8000-12000 EGP',
        type: langAr ? 'دوام كامل' : 'Full-time',
        postedDate: langAr ? 'منذ أسبوع' : '1 week ago',
        requirements: langAr ? [
          'خبرة في إدارة الشبكات والبنية التحتية',
          'معرفة ببروتوكولات الشبكات',
          'شهادات Cisco أو Microsoft',
          'مهارات حل المشاكل'
        ] : [
          'Experience in network and infrastructure management',
          'Knowledge of network protocols',
          'Cisco or Microsoft certifications',
          'Problem-solving skills'
        ]
      }
    ];

    try {
      const res = await firstValueFrom(this.api.getAcademyJob().pipe(catchError(() => of([]))));
      const arr = Array.isArray(res) ? res : [];
      const normalized: JobItem[] = arr.map((r: any): JobItem => ({
        id: String(this.pick(r.id, r.Id, r.ID) ?? Math.random().toString(36).slice(2)),
        jobNo: Number(this.pick(r.jobNo, r.JobNo, Math.floor(1000 + Math.random() * 9000))),
        jobNameL1: String(this.pick(r.jobNameL1, r.JobNameL1, r.name, r.Name, '')),
        jobNameL2: String(this.pick(r.jobNameL2, r.JobNameL2, r.nameEn, r.NameEn, '')),
        description: String(this.pick(r.description, r.Description, '')),
        jobLink: String(this.pick(r.jobLink, r.JobLink, '')),
        category: '',
        experience: String(this.pick(r.experience, r.Experience, '')),
        level: String(this.pick(r.level, r.Level, '')),
        qualification: String(this.pick(r.qualification, r.Qualification, '')),
        jobCategory: String(this.pick(r.jobCategory, r.JobCategory, '')),
        location: String(this.pick(r.location, r.Location, '')),
        salary: String(this.pick(r.salary, r.Salary, '')),
        type: String(this.pick(r.type, r.Type, '')),
        postedDate: String(this.pick(r.postedDate, r.PostedDate, '')),
        requirements: Array.isArray(r.requirements)
          ? r.requirements
          : (typeof r.Requirements === 'string' ? r.Requirements.split('\n').filter(Boolean) : [])
      }));

      // Overlay category using local mapping or derive from JobCategory label
      const map = this.getCategoryMap();
      const withCategory = normalized.map(j => {
        const mappedId = map[j.id];
        const derivedId = this.deriveCategoryIdFromName(j.jobCategory);
        const finalCategoryId = mappedId || derivedId || '';
        return {
          ...j,
          category: finalCategoryId,
          jobCategory: j.jobCategory || (finalCategoryId ? this.labelFromCategoryId(finalCategoryId) : ''),
        };
      });

      this.jobs = withCategory.length ? withCategory : mockJobs;
    } catch (e) {
      this.jobs = mockJobs;
    } finally {
      this.updateCategoryCounts();
      this.loading = false;
    }
  }

  // Deprecated localStorage admin checks removed in favor of AuthService streams

  get filteredJobs(): JobItem[] {
    const byCategory = this.selectedCategory === 'all'
      ? this.jobs
      : this.jobs.filter(j => j.category === this.selectedCategory);
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return byCategory;
    return byCategory.filter(j =>
      (j.jobNameL1 || '').toLowerCase().includes(q) || (j.jobNameL2 || '').toLowerCase().includes(q)
    );
  }

  updateCategoryCounts(): void {
    this.jobCategories = this.jobCategories.map(cat => ({
      ...cat,
      count: this.jobs.filter(j => j.category === cat.id).length
    }));
  }

  selectCategory(id: string): void {
    this.selectedCategory = (this.selectedCategory === id) ? 'all' : id;
  }

  // ===== Modal & Form state (to mirror React behaviors) =====
  isFormOpen = false;
  isSubmitting = false;
  viewMode = false;
  showDeleteDialog = false;
  selectedJob: JobItem | null = null;
  jobToDelete: JobItem | null = null;
  academies: any[] = [];
  branches: any[] = [];
  loadingAcademies = false;

  jobForm: any = {
    JobNameL1: '',
    JobNameL2: '',
    Description: '',
    JobLink: '',
    Experience: '',
    Level: '',
    Qualification: '',
    JobCategory: '',
    Location: '',
    Salary: '',
    Type: '',
    Requirements: '',
    AcademyDataId: '',
    BranchesDataId: '',
  };

  openCreateForm(): void {
    this.selectedJob = null;
    this.viewMode = false;
    this.jobForm = {
      JobNameL1: '',
      JobNameL2: '',
      Description: '',
      JobLink: '',
      Experience: '',
      Level: '',
      Qualification: '',
      JobCategory: '',
      Location: '',
      Salary: '',
      Type: '',
      Requirements: '',
      AcademyDataId: '',
      BranchesDataId: '',
    };
    if (!this.academies.length || !this.branches.length) {
      this.loadLookups();
    }
    this.isFormOpen = true;
  }

  async openEditForm(job: JobItem): Promise<void> {
    this.selectedJob = job;
    this.viewMode = false;

    // Ensure lookups are loaded so selects show options
    if (!this.academies.length || !this.branches.length) {
      await this.loadLookups();
    }

    // Normalize JobCategory to one of 4 labels
    const initialCategoryLabel = job.jobCategory || this.labelFromCategoryId(job.category) || '';
    const normalizedLabel = this.normalizeJobCategoryLabelToAllowed(initialCategoryLabel);

    // Prefill form
    const academyId = (job as any).academyDataId || (job as any).AcademyDataId || '';
    const branchId = (job as any).branchesDataId || (job as any).BranchesDataId || '';

    this.jobForm = {
      JobNameL1: job.jobNameL1 || '',
      JobNameL2: job.jobNameL2 || '',
      Description: job.description || '',
      JobLink: job.jobLink || '',
      Experience: job.experience || '',
      Level: job.level || '',
      Qualification: job.qualification || '',
      JobCategory: normalizedLabel,
      Location: job.location || '',
      Salary: job.salary || '',
      Type: job.type || '',
      Requirements: (job.requirements || []).join('\n'),
      AcademyDataId: academyId,
      BranchesDataId: branchId,
    };

    // Ensure selected options exist in dropdowns
    if (academyId && !this.academies.some(a => String(a.id) === String(academyId))) {
      this.academies = [...this.academies, { id: academyId, AcademyNameL1: academyId }];
    }
    if (branchId && !this.branches.some(b => String(b.id) === String(branchId))) {
      this.branches = [...this.branches, { id: branchId, BranchNameL1: branchId }];
    }

    this.isFormOpen = true;
  }

  openViewDetails(job: JobItem): void {
    this.selectedJob = job;
    this.viewMode = true;
    this.isFormOpen = true;
  }

  handleDelete(job: JobItem): void {
    this.jobToDelete = job;
    this.showDeleteDialog = true;
  }

  async confirmDelete(): Promise<void> {
    if (!this.jobToDelete) return;
    try {
      await firstValueFrom(this.api.deleteAcademyJob(String(this.jobToDelete.id)).pipe(catchError(() => of(null))));
    } finally {
      await this.loadJobsData();
      this.showDeleteDialog = false;
      this.jobToDelete = null;
    }
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.jobToDelete = null;
  }

  closeForm(): void {
    this.isFormOpen = false;
    this.viewMode = false;
    this.selectedJob = null;
  }

  private inferNewJobIdFromList(submitted: { JobNameL1?: string; JobLink?: string; Description?: string }, list: JobItem[]): string {
    const name = (submitted.JobNameL1 || '').trim();
    const link = (submitted.JobLink || '').trim();
    const desc = (submitted.Description || '').trim();
    const hit = list.find(j =>
      (j.jobNameL1 || '').trim() === name &&
      (j.jobLink || '').trim() === link &&
      (j.description || '').trim() === desc
    );
    return hit ? String(hit.id) : '';
  }

  async submitForm(e?: Event): Promise<void> {
    if (e) e.preventDefault();
    this.isSubmitting = true;
    this.error = null;
    try {
      const nameL1 = String(this.jobForm.JobNameL1 || '').trim();
      if (!nameL1 || nameL1.length < 2) {
        throw new Error(this.isRtl ? 'اسم الوظيفة مطلوب (أقل شيء حرفان)' : 'Job Name (Arabic) is required (min 2 chars)');
      }
      if (!this.jobForm.AcademyDataId) {
        throw new Error(this.isRtl ? 'اختر الأكاديمية' : 'Select Academy');
      }
      const link = String(this.jobForm.JobLink || '').trim();
      if (link) {
        try { new URL(link); } catch {
          throw new Error(this.isRtl ? 'رابط التقديم غير صالح' : 'Application link is not a valid URL');
        }
      }
      const desc = String(this.jobForm.Description || '');
      if (desc && desc.length > 500) {
        throw new Error(this.isRtl ? 'الوصف يجب ألا يتجاوز 500 حرف' : 'Description must be <= 500 characters');
      }

      const formData = new FormData();
      if (!this.selectedJob) {
        const jobNo = Math.floor(1000 + Math.random() * 900000);
        formData.append('JobNo', String(jobNo));
      }

      const allowedKeys = ['JobNameL1', 'JobNameL2', 'Description', 'JobLink', 'AcademyDataId', 'BranchesDataId', 'JobCategory'];
      allowedKeys.forEach(key => {
        const val = (this.jobForm as any)[key];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          formData.append(key, String(val));
        }
      });

      // For inference post-create
      const submittedSnapshot = {
        JobNameL1: String(this.jobForm.JobNameL1 || ''),
        JobLink: String(this.jobForm.JobLink || ''),
        Description: String(this.jobForm.Description || ''),
      };

      const categoryId = this.deriveCategoryIdFromName(this.jobForm.JobCategory);

      if (this.selectedJob) {
        const res = await firstValueFrom(this.api.updateAcademyJob(String(this.selectedJob.id), formData).pipe(catchError((err) => {
          this.error = this.isRtl ? 'تعذّر تحديث الوظيفة' : 'Failed to update job';
          return of(null);
        })));
        if (!this.error && this.selectedJob?.id && categoryId) {
          this.setJobCategoryMapping(String(this.selectedJob.id), categoryId);
        }
      } else {
        const res = await firstValueFrom(this.api.createAcademyJob(formData).pipe(catchError((err) => {
          this.error = this.isRtl ? 'تعذّر إنشاء الوظيفة' : 'Failed to create job';
          return of(null);
        })));
        let newId = res && (res.id || res.Id || res.ID) ? String(res.id || res.Id || res.ID) : '';
        if (!newId) {
          // Refetch list and infer id by matching submitted fields
          const list = await firstValueFrom(this.api.getAcademyJob().pipe(catchError(() => of([]))));
          const items: JobItem[] = Array.isArray(list) ? list.map((r: any): JobItem => ({
            id: String(this.pick(r.id, r.Id, r.ID) ?? Math.random().toString(36).slice(2)),
            jobNo: Number(this.pick(r.jobNo, r.JobNo, Math.floor(1000 + Math.random() * 9000))),
            jobNameL1: String(this.pick(r.jobNameL1, r.JobNameL1, r.name, r.Name, '')),
            jobNameL2: String(this.pick(r.jobNameL2, r.JobNameL2, r.nameEn, r.NameEn, '')),
            description: String(this.pick(r.description, r.Description, '')),
            jobLink: String(this.pick(r.jobLink, r.JobLink, '')),
            category: '',
            experience: String(this.pick(r.experience, r.Experience, '')),
            level: String(this.pick(r.level, r.Level, '')),
            qualification: String(this.pick(r.qualification, r.Qualification, '')),
            jobCategory: String(this.pick(r.jobCategory, r.JobCategory, '')),
            location: String(this.pick(r.location, r.Location, '')),
            salary: String(this.pick(r.salary, r.Salary, '')),
            type: String(this.pick(r.type, r.Type, '')),
            postedDate: String(this.pick(r.postedDate, r.PostedDate, '')),
          })) : [];
          newId = this.inferNewJobIdFromList(submittedSnapshot, items);
        }
        if (!this.error && newId && categoryId) {
          this.setJobCategoryMapping(newId, categoryId);
        }
      }

      if (this.error) return;

      await this.loadJobsData();
      this.closeForm();
    } catch (err: any) {
      this.error = err?.message || (this.isRtl ? 'حدث خطأ' : 'An error occurred');
      return;
    } finally {
      this.isSubmitting = false;
    }
  }

  // Helper to pick first defined value without mixing ?? and ||
  private pick<T>(...values: T[]): T | undefined {
    for (const v of values) {
      if (v !== undefined && v !== null) return v;
    }
    return undefined;
  }

  private async loadLookups(): Promise<void> {
    this.loadingAcademies = true;
    try {
      const [acRes, brRes] = await Promise.all([
        firstValueFrom(this.api.getAcademyData().pipe(catchError(() => of([])))),
        firstValueFrom(this.api.getBranchesData().pipe(catchError(() => of([]))))
      ]);
      this.academies = Array.isArray(acRes) ? acRes : [];
      this.branches = Array.isArray(brRes) ? brRes : [];
    } finally {
      this.loadingAcademies = false;
    }
  }

  // Deprecated debug stubs removed
}

