import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-trainer-edit',
  templateUrl: './trainer-edit.component.html',
  styleUrls: ['./trainer-edit.component.css']
})
export class TrainerEditComponent implements OnInit {
  isRtl = false;
  loading = true;
  trainerId = '';
  saving = false;
  error: string | null = null;
  success = false;

  // Minimal editable fields aligned with API
  form: any = {
    TeacherNameL1: '',
    TeacherNameL2: '',
    TeacherAddress: '',
    NationalId: '',
    DateStart: '',
    TeacherMobile: '',
    TeacherPhone: '',
    TeacherWhatsapp: '',
    TeacherEmail: '',
    Description: '',
    TeacherCancel: '',
    AcademyDataId: '',
    BranchesDataId: ''
  };

  // Separate fields for user-friendly description editing
  descriptionFields: any = {
    trainerType: '',
    description: '',
    cv: ''
  };

  imagePreviewUrl: string | null = null;
  imageFile: File | null = null;
  
  // Academy and Branch data
  academies: any[] = [];
  branches: any[] = [];
  academyName: string = '';
  branchName: string = '';

  constructor(private route: ActivatedRoute, private router: Router, private api: ApiService, private lang: LanguageService) {}

  ngOnInit(): void {
    this.isRtl = this.lang.current === 'ar';
    this.trainerId = this.route.snapshot.queryParamMap.get('id') || '';
    this.loadAcademiesAndBranches();
    if (this.trainerId) {
      this.load();
    } else {
      this.loading = false;
    }
  }

  goBack(): void { this.router.navigateByUrl('/trainers'); }
  
  goToLogin(): void { this.router.navigateByUrl('/login'); }

  load(): void {
    this.loading = true; this.error = null; this.success = false;
    this.api.getTeacherDataById(this.trainerId).subscribe({
      next: (res) => {
        const t = res || {};
        this.form = {
          TeacherNameL1: t.teacherNameL1 || t.TeacherNameL1 || '',
          TeacherNameL2: t.teacherNameL2 || t.TeacherNameL2 || '',
          TeacherAddress: t.teacherAddress || t.TeacherAddress || '',
          NationalId: t.nationalId || t.NationalId || '',
          DateStart: (t.dateStart || t.DateStart || '').toString().substring(0,10),
          TeacherMobile: t.teacherMobile || t.TeacherMobile || '',
          TeacherPhone: t.teacherPhone || t.TeacherPhone || '',
          TeacherWhatsapp: t.teacherWhatsapp || t.TeacherWhatsapp || '',
          TeacherEmail: t.teacherEmail || t.TeacherEmail || '',
          Description: t.description || t.Description || '',
          TeacherCancel: (t.teacherCancel || t.TeacherCancel || '').toString().substring(0,10),
          AcademyDataId: t.academyDataId || t.AcademyDataId || '',
          BranchesDataId: t.branchesDataId || t.BranchesDataId || ''
        };
        
        // Parse the description into separate fields
        this.parseDescription(this.form.Description);
        
        // Load academy and branch names
        this.loadAcademyAndBranchNames();
        this.loading = false;
      },
      error: (e) => { this.error = e?.message || 'Failed to load'; this.loading = false; }
    });
  }

  onFileChange(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) { this.imageFile = null; this.imagePreviewUrl = null; return; }
    this.imageFile = file;
    const reader = new FileReader();
    reader.onload = () => { this.imagePreviewUrl = reader.result as string; };
    reader.readAsDataURL(file);
  }

  save(): void {
    if (this.saving) return;
    
    // Validate required fields
    if (!this.form.TeacherNameL1 || this.form.TeacherNameL1.trim().length < 3) {
      this.error = this.isRtl ? 'اسم المدرب (عربي) مطلوب ويجب أن يكون 3 أحرف على الأقل' : 'Teacher name (Arabic) is required and must be at least 3 characters';
      return;
    }
    
    if (!this.form.TeacherAddress || this.form.TeacherAddress.trim().length < 3) {
      this.error = this.isRtl ? 'العنوان مطلوب ويجب أن يكون 3 أحرف على الأقل' : 'Address is required and must be at least 3 characters';
      return;
    }
    
    if (!this.form.NationalId || this.form.NationalId.trim() === '') {
      this.error = this.isRtl ? 'رقم الهوية مطلوب' : 'National ID is required';
      return;
    }
    
    if (!this.form.TeacherWhatsapp || this.form.TeacherWhatsapp.trim() === '') {
      this.error = this.isRtl ? 'رقم الواتساب مطلوب' : 'WhatsApp number is required';
      return;
    }
    
    if (!this.form.TeacherEmail || this.form.TeacherEmail.trim() === '') {
      this.error = this.isRtl ? 'البريد الإلكتروني مطلوب' : 'Email is required';
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.form.TeacherEmail)) {
      this.error = this.isRtl ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format';
      return;
    }
    
    this.saving = true; 
    this.error = null; 
    this.success = false;
    
    // Combine description fields back into original format
    this.form.Description = this.combineDescription();
    
    // Create FormData for multipart/form-data
    const formData = new FormData();
    
    // Add all form fields
    Object.keys(this.form).forEach(key => {
      if (this.form[key] !== null && this.form[key] !== undefined && this.form[key] !== '') {
        formData.append(key, this.form[key]);
      }
    });
    
    // Add image file if exists
    if (this.imageFile) {
      formData.append('Image', this.imageFile);
    }
    
    // Add the ID field
    formData.append('Id', this.trainerId);
    
    this.api.updateTeacherData(this.trainerId, formData).subscribe({
      next: _ => { 
        this.success = true; 
        this.saving = false; 
        // Clear error on success
        this.error = null;
      },
      error: e => { 
        console.error('Save error:', e);
        this.error = e?.error?.message || e?.message || (this.isRtl ? 'فشل في الحفظ' : 'Save failed'); 
        this.saving = false; 
      }
    });
  }

  async loadAcademiesAndBranches(): Promise<void> {
    try {
      // Load academies
      const academiesResponse = await firstValueFrom(this.api.getAcademyData().pipe(catchError((error) => {
        console.warn('Failed to load academies:', error);
        if (error.status === 401) {
          this.error = this.isRtl ? 'يجب تسجيل الدخول أولاً' : 'Please login first';
        }
        return of([]);
      })));
      this.academies = Array.isArray(academiesResponse) ? academiesResponse : [];

      // Load branches
      const branchesResponse = await firstValueFrom(this.api.getBranchesData().pipe(catchError((error) => {
        console.warn('Failed to load branches:', error);
        if (error.status === 401) {
          this.error = this.isRtl ? 'يجب تسجيل الدخول أولاً' : 'Please login first';
        }
        return of([]);
      })));
      this.branches = Array.isArray(branchesResponse) ? branchesResponse : [];
    } catch (e) {
      console.warn('Failed to load academies and branches:', e);
      this.error = this.isRtl ? 'فشل في تحميل البيانات' : 'Failed to load data';
    }
  }

  async loadAcademyAndBranchNames(): Promise<void> {
    if (this.form.AcademyDataId) {
      try {
        const academy = await firstValueFrom(this.api.getAcademyDataById(this.form.AcademyDataId).pipe(catchError((error) => {
          console.warn(`Failed to load academy data for ID: ${this.form.AcademyDataId}`, error);
          return of(null);
        })));
        if (academy) {
          this.academyName = this.pick(academy.academyNameL1, academy.AcademyNameL1, academy.name, academy.Name, '');
        }
      } catch (e) {
        console.warn(`Failed to load academy data for ID: ${this.form.AcademyDataId}`, e);
      }
    }

    if (this.form.BranchesDataId) {
      try {
        const branch = await firstValueFrom(this.api.getBranchesDataById(this.form.BranchesDataId).pipe(catchError((error) => {
          console.warn(`Failed to load branch data for ID: ${this.form.BranchesDataId}`, error);
          return of(null);
        })));
        if (branch) {
          this.branchName = this.pick(branch.branchNameL1, branch.BranchNameL1, branch.name, branch.Name, '');
        }
      } catch (e) {
        console.warn(`Failed to load branch data for ID: ${this.form.BranchesDataId}`, e);
      }
    }
  }

  onAcademyChange(academyId: string): void {
    this.form.AcademyDataId = academyId;
    const academy = this.academies.find(a => a.id === academyId || a.Id === academyId);
    if (academy) {
      this.academyName = this.pick(academy.academyNameL1, academy.AcademyNameL1, academy.name, academy.Name, '');
    } else {
      this.academyName = '';
    }
  }

  onBranchChange(branchId: string): void {
    this.form.BranchesDataId = branchId;
    const branch = this.branches.find(b => b.id === branchId || b.Id === branchId);
    if (branch) {
      this.branchName = this.pick(branch.branchNameL1, branch.BranchNameL1, branch.name, branch.Name, '');
    } else {
      this.branchName = '';
    }
  }

  pick(...values: any[]): string {
    for (const value of values) {
      if (value && value.toString().trim() !== '') {
        return value.toString().trim();
      }
    }
    return '';
  }

  // Parse existing description format into separate fields
  parseDescription(description: string): void {
    if (!description) {
      this.descriptionFields = { trainerType: '', description: '', cv: '' };
      return;
    }

    // Parse format: "description | Category: type | CV: url"
    const parts = description.split(' | ');
    let parsedDescription = '';
    let trainerType = '';
    let cv = '';

    for (const part of parts) {
      if (part.startsWith('Category:')) {
        const categoryValue = part.replace('Category:', '').trim().toLowerCase();
        // Map old category values to new ones
        switch (categoryValue) {
          case 'softskill':
          case 'soft_skill':
          case 'soft-skills':
            trainerType = 'softSkills';
            break;
          case 'technical':
            trainerType = 'technical';
            break;
          case 'freelancer':
            trainerType = 'freelancer';
            break;
          case 'english':
            trainerType = 'english';
            break;
          default:
            trainerType = categoryValue; // Keep original if not recognized
        }
      } else if (part.startsWith('CV:')) {
        cv = part.replace('CV:', '').trim();
      } else {
        parsedDescription = part.trim();
      }
    }

    this.descriptionFields = {
      trainerType: trainerType,
      description: parsedDescription,
      cv: cv
    };
  }

  // Combine separate fields back into original format
  combineDescription(): string {
    const parts = [];
    
    if (this.descriptionFields.description) {
      parts.push(this.descriptionFields.description);
    }
    
    if (this.descriptionFields.trainerType) {
      // Map new category values back to the format expected by the trainers page
      let categoryValue = this.descriptionFields.trainerType;
      switch (this.descriptionFields.trainerType) {
        case 'softSkills':
          categoryValue = 'softSkills';
          break;
        case 'technical':
          categoryValue = 'technical';
          break;
        case 'freelancer':
          categoryValue = 'freelancer';
          break;
        case 'english':
          categoryValue = 'english';
          break;
        default:
          categoryValue = this.descriptionFields.trainerType;
      }
      parts.push(`Category: ${categoryValue}`);
    }
    
    if (this.descriptionFields.cv) {
      parts.push(`CV: ${this.descriptionFields.cv}`);
    }
    
    return parts.join(' | ');
  }
}


