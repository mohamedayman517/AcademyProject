import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';
import { combineLatest, Subscription } from 'rxjs';

@Component({
  selector: 'app-trainers',
  templateUrl: './trainers.component.html',
  styleUrls: ['./trainers.component.css']
})
export class TrainersComponent implements OnInit, OnDestroy {
  loading = false;
  error: string | null = null;
  trainers: any[] = [];
  selectedCategory: string | null = null;
  isAdmin = false;
  isRtl = false;
  searchQuery = '';
  academies: any[] = [];
  branches: any[] = [];
  loadingAcademies = false;
  private subs: Subscription[] = [];

  // Training Type categories
  trainingTypeCategories = [
    { id: 'softSkills', nameAr: 'المهارات الناعمة', nameEn: 'Soft Skills', color: 'bg-purple-500', count: 0 },
    { id: 'technical', nameAr: 'تقني', nameEn: 'Technical', color: 'bg-blue-500', count: 0 },
    { id: 'freelancer', nameAr: 'مستقل', nameEn: 'Freelancer', color: 'bg-green-500', count: 0 },
    { id: 'english', nameAr: 'إنجليزي', nameEn: 'English', color: 'bg-orange-500', count: 0 },
  ];

  // Delete dialog state
  showDeleteDialog = false;
  trainerToDelete: any = null;

  // Add Trainer modal state
  isAddOpen = false;
  activeAddTab: 'basic' | 'cv' | 'video' = 'basic';
  selectedAddCategory: 'softSkill' | 'technical' | 'freelancer' | 'english' = 'softSkill';
  lastCreatedTrainerId = '';

  // Forms state
  form: any = {
    TeacherNameL1: '',
    TeacherNameL2: '',
    TeacherAddress: '',
    NationalId: '',
    TeacherMobile: '',
    TeacherPhone: '',
    TeacherWhatsapp: '',
    TeacherEmail: '',
    Description: '',
    AcademyDataId: '',
    BranchesDataId: ''
  };
  imageFile: File | null = null;
  cvUrlInput = '';
  videoUrl = '';
  savingVideo = false;

  constructor(private api: ApiService, private router: Router, private lang: LanguageService, private auth: AuthService) {}

  ngOnInit(): void {
    this.isRtl = this.lang.current === 'ar';
    // Align admin detection with Jobs page using AuthService streams
    const s = combineLatest([this.auth.isAuthenticated$, this.auth.roles$]).subscribe(([isAuth, roles]) => {
      const normalized = (roles || []).map(r => String(r).toLowerCase());
      const isAdminRole = normalized.some(r => ['admin', 'administrator', 'superadmin', 'supportagent'].includes(r));
      this.isAdmin = isAuth && isAdminRole;
    });
    this.subs.push(s);
    this.syncRouteState();
    this.loadAllTrainers();
    if (this.isAdmin) {
      this.loadAcademiesAndBranches();
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  // Local detectAdmin removed in favor of AuthService streams (mirrors Jobs page)

  private syncRouteState(): void {
    const path = window.location.pathname;
    if (path.includes('/trainers/soft-skills')) this.selectedCategory = 'softSkills';
    else if (path.includes('/trainers/technical')) this.selectedCategory = 'technical';
    else if (path.includes('/trainers/freelancer')) this.selectedCategory = 'freelancer';
    else if (path.includes('/trainers/english')) this.selectedCategory = 'english';
    else this.selectedCategory = null;
  }

  loadAllTrainers(): void {
    this.loading = true;
    this.error = null;
    this.api.getTeacherData().subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : [];
        const formatted = list.map((trainer: any) => ({
          id: trainer.id || trainer.Id,
          name:
            trainer.teacherNameL1 ||
            trainer.TeacherNameL1 ||
            trainer.teacherNameL2 ||
            trainer.TeacherNameL2 ||
            'Unknown',
          description: trainer.description || trainer.Description || '',
          image: trainer.imageFile || trainer.ImageFile || '',
          email: trainer.teacherEmail || trainer.TeacherEmail || '',
          phone: trainer.teacherMobile || trainer.TeacherMobile || trainer.teacherPhone || trainer.TeacherPhone || '',
        }));

        this.trainers = formatted;
        
        // Update category counts after loading trainers
        this.updateTrainingTypeCounts();
        
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load trainers';
      this.loading = false;
        this.trainers = [];
      },
    });
  }

  onCategorySelect(category: string): void {
    this.selectedCategory = category;
    const routeMap: any = {
      softSkill: '/trainers/soft-skills',
      technical: '/trainers/technical',
      freelancer: '/trainers/freelancer',
      english: '/trainers/english',
    };
    this.router.navigateByUrl(routeMap[category] || '/trainers');
    this.loadAllTrainers();
  }

  openTrainer(trainerId: string): void {
    this.router.navigate(['/trainer', trainerId]);
  }

  editTrainer(trainerId: string): void {
    this.router.navigate(['/trainers/edit'], { queryParams: { id: trainerId } });
  }

  // Admin actions
  openDeleteDialog(trainer: any): void {
    this.trainerToDelete = trainer;
    this.showDeleteDialog = true;
  }

  confirmDelete(): void {
    if (!this.trainerToDelete?.id) {
      this.showDeleteDialog = false;
      return;
    }
    this.api.deleteTeacherData(this.trainerToDelete.id).subscribe({
      next: () => {
        this.trainers = this.trainers.filter(t => t.id !== this.trainerToDelete.id);
        this.showDeleteDialog = false;
        this.trainerToDelete = null;
      },
      error: () => {
        this.showDeleteDialog = false;
        this.trainerToDelete = null;
      }
    });
  }

  // Load academies and branches
  private loadAcademiesAndBranches(): void {
    this.loadingAcademies = true;
    this.api.getAcademyData().subscribe({
      next: (res) => { this.academies = Array.isArray(res) ? res : []; },
      error: () => { this.academies = []; },
      complete: () => {
        this.api.getBranchesData().subscribe({
          next: (res2) => { this.branches = Array.isArray(res2) ? res2 : []; },
          error: () => { this.branches = []; },
          complete: () => { this.loadingAcademies = false; }
        });
      }
    });
  }

  retryLoadAcademiesAndBranches(): void { this.loadAcademiesAndBranches(); }

  // Add Trainer modal
  openAddModal(): void {
    this.isAddOpen = true;
    this.activeAddTab = 'basic';
    this.selectedAddCategory = 'softSkill';
  }

  handleCreateTrainer(e: Event): void {
    e.preventDefault();
    this.form.NationalId = String(this.form.NationalId || '').replace(/\D/g, '').slice(0, 14);
    if (!this.validateTrainerForm()) return;
    if (!this.form.AcademyDataId) { return; }
    this.activeAddTab = 'cv';
  }

  handleUploadCv(e: Event): void {
    e.preventDefault();
    this.activeAddTab = 'video';
  }

  handleSaveVideo(e: Event): void {
    e.preventDefault();
    this.savingVideo = true;
    const base: any = {
      TeacherNameL1: (this.form.TeacherNameL1 || '').trim(),
      TeacherNameL2: (this.form.TeacherNameL2 || '').trim(),
      TeacherAddress: (this.form.TeacherAddress || '').trim(),
      NationalId: (this.form.NationalId || '').trim(),
      TeacherWhatsapp: (this.form.TeacherWhatsapp || '').trim(),
      TeacherEmail: (this.form.TeacherEmail || '').trim(),
      AcademyDataId: this.form.AcademyDataId,
      BranchesDataId: this.form.BranchesDataId,
    };
    if (!base.TeacherNameL1 || !base.TeacherAddress || !/^\d{14}$/.test(base.NationalId) || !base.TeacherWhatsapp || !base.TeacherEmail || !base.AcademyDataId) {
      this.activeAddTab = 'basic';
      this.savingVideo = false;
      return;
    }

    const formData = new FormData();
    Object.keys(base).forEach(k => formData.append(k, base[k]));
    const categoryTag = `Category: ${this.selectedAddCategory}`;
    let desc = (this.form.Description || '').trim();
    desc = desc ? `${desc} | ${categoryTag}` : categoryTag;
    if ((this.cvUrlInput || '').trim()) desc = this.mergeDescription(desc, `CV: ${this.cvUrlInput.trim()}`);
    if ((this.videoUrl || '').trim()) desc = this.mergeDescription(desc, `Video: ${(this.videoUrl || '').slice(0, 100)}`);
    formData.append('Description', desc);
    if (this.imageFile) formData.append('ImageFile', this.imageFile);

    this.api.createTeacherData(formData).subscribe({
      next: () => {
        this.isAddOpen = false;
        this.videoUrl = '';
        this.cvUrlInput = '';
        this.form.Description = '';
        this.loadAllTrainers();
      },
      error: () => {},
      complete: () => { this.savingVideo = false; }
    });
  }

  // Helpers
  validateTrainerForm(): boolean {
    const name1 = String(this.form.TeacherNameL1 || '').trim();
    const name2 = String(this.form.TeacherNameL2 || '').trim();
    const nid = String(this.form.NationalId || '').trim();
    if (name1.length < 3 || name1.length > 70) return false;
    if (name2 && (name2.length < 3 || name2.length > 70)) return false;
    if (!/^\d{14}$/.test(nid)) return false;
    if (!String(this.form.TeacherWhatsapp || '').trim()) return false;
    if (!String(this.form.TeacherEmail || '').trim()) return false;
    return true;
  }

  mergeDescription(prev: string, add: string): string {
    const MAX = 500;
    const p = (prev || '').trim();
    const a = (add || '').trim();
    if (!p) return a.slice(0, MAX);
    const sep = ' | ';
    const total = p.length + sep.length + a.length;
    if (total <= MAX) return p + sep + a;
    const allowedPrev = Math.max(0, MAX - sep.length - a.length);
    const trimmedPrev = p.slice(0, allowedPrev);
    if (trimmedPrev) return trimmedPrev + sep + a.slice(0, MAX - trimmedPrev.length - sep.length);
    return a.slice(0, MAX);
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.imageFile = input && input.files && input.files.length ? input.files[0] : null;
  }

  get filteredTrainers(): any[] {
    let filtered = this.trainers;
    
    // Filter by search query
    const q = (this.searchQuery || '').trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(t =>
        (t.name || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
      );
    }
    
    // Filter by selected training type category
    if (this.selectedCategory && this.selectedCategory !== 'all') {
      filtered = filtered.filter(trainer => {
        const trainerTrainingType = this.getTrainerTrainingType(trainer);
        return trainerTrainingType === this.selectedCategory;
      });
    }
    
    return filtered;
  }

  selectTrainingTypeCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
  }

  // Extract training type from trainer description
  getTrainerTrainingType(trainer: any): string {
    const description = (trainer.description || '').toLowerCase();
    
    // Look for "Category: " pattern
    const categoryMatch = description.match(/category:\s*(\w+)/);
    if (categoryMatch) {
      const category = categoryMatch[1].toLowerCase();
      
      // Map the category to our training type IDs
      switch (category) {
        case 'softskill':
        case 'soft_skill':
        case 'soft-skills':
          return 'softSkills';
        case 'technical':
          return 'technical';
        case 'freelancer':
          return 'freelancer';
        case 'english':
          return 'english';
        default:
          return 'softSkills'; // Default fallback
      }
    }
    
    return 'softSkills'; // Default if no category found
  }

  // Update category counts based on actual trainer data
  updateTrainingTypeCounts(): void {
    // Reset all counts
    this.trainingTypeCategories.forEach(category => {
      category.count = 0;
    });

    // Count trainers for each category
    this.trainers.forEach(trainer => {
      const trainingType = this.getTrainerTrainingType(trainer);
      const category = this.trainingTypeCategories.find(c => c.id === trainingType);
      if (category) {
        category.count++;
      }
    });
  }
}

