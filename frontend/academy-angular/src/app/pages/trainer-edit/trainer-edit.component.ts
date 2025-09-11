import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';

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
    BranchesDataId: '',
    CountryCodeId: '',
    GovernorateCodeId: '',
    CityCodeId: ''
  };

  imagePreviewUrl: string | null = null;
  imageFile: File | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private api: ApiService, private lang: LanguageService) {}

  ngOnInit(): void {
    this.isRtl = this.lang.current === 'ar';
    this.trainerId = this.route.snapshot.queryParamMap.get('id') || '';
    if (this.trainerId) {
      this.load();
    } else {
      this.loading = false;
    }
  }

  goBack(): void { this.router.navigateByUrl('/trainers'); }

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
          BranchesDataId: t.branchesDataId || t.BranchesDataId || '',
          CountryCodeId: t.countryCodeId || t.CountryCodeId || '',
          GovernorateCodeId: t.governorateCodeId || t.GovernorateCodeId || '',
          CityCodeId: t.cityCodeId || t.CityCodeId || ''
        };
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
    this.saving = true; this.error = null; this.success = false;
    const payload: any = { ...this.form };
    if (this.imageFile) payload.ImageFile = this.imageFile;
    this.api.updateTeacherData(this.trainerId, payload).subscribe({
      next: _ => { this.success = true; this.saving = false; },
      error: e => { this.error = e?.error?.message || e?.message || 'Save failed'; this.saving = false; }
    });
  }
}


