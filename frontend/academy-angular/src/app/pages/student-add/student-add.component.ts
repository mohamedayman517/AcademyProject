import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-student-add',
  template: `
    <section class="container" dir="rtl">
      <div class="hero">
        <div class="hero-content">
          <h1>إضافة طالب</h1>
          <p>إنشاء سجل طالب جديد يدويًا.</p>
        </div>
      </div>

      <form class="card" (ngSubmit)="submit()">
        <div class="row two">
          <div>
            <label class="label">الاسم</label>
            <input class="input" [(ngModel)]="form.studentNameL1" name="name" required />
          </div>
          <div>
            <label class="label">البريد</label>
            <input class="input" type="email" [(ngModel)]="form.studentEmail" name="email" required />
          </div>
        </div>
        <div class="row two">
          <div>
            <label class="label">الهاتف</label>
            <input class="input" [(ngModel)]="form.studentPhone" name="phone" />
          </div>
          <div>
            <label class="label">الأكاديمية</label>
            <input class="input" [(ngModel)]="form.academyDataId" name="academy" />
          </div>
        </div>
        <div class="row">
          <label class="label">الفرع</label>
          <input class="input" [(ngModel)]="form.branchesDataId" name="branch" />
        </div>
        <div class="row right">
          <button class="btn" type="submit" [disabled]="loading">حفظ</button>
        </div>
        <div class="note" *ngIf="success">تم الحفظ بنجاح</div>
        <div class="note error" *ngIf="error">{{ error }}</div>
      </form>
    </section>
  `,
  styles: [`
    .container{padding:24px}
    .hero{background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:16px;padding:18px;color:#fff;margin-bottom:12px}
    .card{background:#fff;border:1px solid #eef0f4;border-radius:12px;padding:12px}
    .row{display:grid;gap:8px;margin-bottom:8px}
    .row.two{grid-template-columns:1fr;}
    @media(min-width: 720px){ .row.two{grid-template-columns:1fr 1fr;} }
    .right{justify-content:end}
    .label{font-weight:600}
    .input{height:38px;border:1px solid #e5e7eb;border-radius:10px;padding:0 10px;background:#fafafa}
    .btn{height:38px;padding:0 12px;border-radius:10px;border:1px solid #e5e7eb;background:#fff;cursor:pointer}
    .note{color:#0a7}
    .note.error{color:#c33}
  `]
})
export class StudentAddComponent {
  loading = false;
  error: string | null = null;
  success = false;

  form: any = {
    studentNameL1: '',
    studentNameL2: '',
    studentEmail: '',
    studentPhone: '',
    academyDataId: '',
    branchesDataId: '',
    active: true,
    language: 'ar',
    trainingProvider: 'Academy System',
    studentMobil: ''
  };

  constructor(private api: ApiService) {}

  submit(){
    if(this.loading) return;
    this.loading = true; this.error = null; this.success = false;
    const payload = { ...this.form };
    this.api.createStudentData(payload).subscribe({
      next: _ => { this.success = true; this.loading = false; },
      error: e => { this.error = e?.message || 'فشل الحفظ'; this.loading = false; }
    })
  }
}
