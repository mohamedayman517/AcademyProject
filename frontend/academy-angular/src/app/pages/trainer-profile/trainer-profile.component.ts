import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-trainer-profile',
  templateUrl: './trainer-profile.component.html',
  styleUrls: ['./trainer-profile.component.css']
})
export class TrainerProfileComponent implements OnInit {
  isRtl = false;
  loading = true;
  error: string | null = null;
  trainer: any = null;
  trainerId = '';

  constructor(private route: ActivatedRoute, private api: ApiService, private lang: LanguageService, private router: Router) {}

  ngOnInit(): void {
    this.isRtl = this.lang.current === 'ar';
    this.trainerId = this.route.snapshot.paramMap.get('id') || '';
    
    if (!this.trainerId) {
      this.error = this.isRtl ? 'معرف المدرب غير صحيح' : 'Invalid trainer ID';
      this.loading = false;
      return;
    }
    
    this.loadTrainerData();
  }

  loadTrainerData(): void {
    this.loading = true;
    this.error = null;
    
    this.api.getTeacherDataById(this.trainerId).subscribe({
      next: (res) => {
        if (res && typeof res === 'object' && Object.keys(res).length > 0) {
          this.trainer = {
            id: res.id || res.Id || this.trainerId,
            teacherNameL1: res.teacherNameL1 || res.TeacherNameL1 || '',
            teacherNameL2: res.teacherNameL2 || res.TeacherNameL2 || '',
            teacherAddress: res.teacherAddress || res.TeacherAddress || '',
            teacherMobile: res.teacherMobile || res.TeacherMobile || '',
            teacherPhone: res.teacherPhone || res.TeacherPhone || '',
            teacherWhatsapp: res.teacherWhatsapp || res.TeacherWhatsapp || '',
            teacherEmail: res.teacherEmail || res.TeacherEmail || '',
            description: res.description || res.Description || '',
            dateStart: res.dateStart || res.DateStart || '',
            imageFile: res.imageFile || res.ImageFile || null
          };
          this.error = null;
        } else {
          // Use fallback data if no data found
          this.trainer = this.getFallbackData();
          this.error = this.isRtl ? 'تم استخدام بيانات تجريبية' : 'Using fallback data';
        }
        this.loading = false;
      },
      error: (e) => {
        console.error('Error loading trainer data:', e);
        this.trainer = this.getFallbackData();
        this.error = this.isRtl ? 'تم استخدام بيانات تجريبية بسبب خطأ في API' : 'Using fallback data due to API error';
        this.loading = false;
      }
    });
  }

  getFallbackData(): any {
    return {
      id: this.trainerId,
      teacherNameL1: this.isRtl ? 'أحمد محمد علي' : 'Ahmed Mohamed Ali',
      teacherNameL2: 'Ahmed Mohamed Ali',
      teacherAddress: this.isRtl ? 'القاهرة، مصر' : 'Cairo, Egypt',
      teacherMobile: '+201234567890',
      teacherPhone: '+201234567891',
      teacherWhatsapp: '+201234567890',
      teacherEmail: 'ahmed.mohamed@example.com',
      description: this.isRtl 
        ? 'مدرب محترف مع أكثر من 10 سنوات من الخبرة في مجال التدريب والتطوير. متخصص في تطوير المهارات الشخصية والقيادية، مع خبرة واسعة في العمل مع الشركات والمؤسسات التعليمية.'
        : 'Professional trainer with over 10 years of experience in training and development. Specialized in personal and leadership skills development, with extensive experience working with companies and educational institutions.',
      dateStart: '2014-01-01',
      imageFile: null
    };
  }

  goBack(): void { 
    this.router.navigateByUrl('/trainers'); 
  }

  editCurrent(): void {
    const id = this.trainer?.id;
    if (!id) { return; }
    this.router.navigate(['/trainer-edit'], { queryParams: { id } });
  }


  getCvUrlFromDescription(desc: string): string {
    if (!desc) return '';
    try {
      const text = String(desc);
      const urlMatch = text.match(/https?:\/\/[^\s)]+\.(pdf|doc|docx)(\?[^\s)]*)?/i);
      if (urlMatch && urlMatch[0]) return urlMatch[0];
      const afterTag = text.split(/CV\s*:\s*/i)[1];
      if (afterTag) {
        const direct = afterTag.trim().split(/\s+/)[0];
        if (/^https?:\/\//i.test(direct)) return direct;
        if (/\.(pdf|doc|docx)$/i.test(direct)) {
          return '';
        }
      }
    } catch (_) {}
    return '';
  }

  getExperienceYears(): number {
    if (!this.trainer?.dateStart) return 0;
    const startDate = new Date(this.trainer.dateStart);
    const currentDate = new Date();
    return currentDate.getFullYear() - startDate.getFullYear();
  }

  getStartYear(): number {
    if (!this.trainer?.dateStart) return 0;
    return new Date(this.trainer.dateStart).getFullYear();
  }
}


