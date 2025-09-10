import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  template: `
  <section class="register-hero" dir="rtl">
    <div class="container">
      <h1 class="title">{{ 'register_title' | t }}</h1>
      <p class="subtitle">{{ 'register_subtitle' | t }}</p>
    </div>
  </section>

  <section class="register-wrap" dir="rtl">
    <div class="container">
      <form class="card" (ngSubmit)="submit()">
        <div *ngIf="error" class="alert error">{{ error }}</div>
        <div *ngIf="success" class="alert success">{{ success }}</div>
        <div class="grid">
          <label class="field">
            <span>{{ 'first_name' | t }}</span>
            <input type="text" [(ngModel)]="form.firstName" name="firstName" [disabled]="submitting" required />
          </label>
          <label class="field">
            <span>{{ 'last_name' | t }}</span>
            <input type="text" [(ngModel)]="form.lastName" name="lastName" [disabled]="submitting" required />
          </label>
          <label class="field">
            <span>{{ 'email_label' | t }}</span>
            <input type="email" [(ngModel)]="form.email" name="email" [disabled]="submitting" required />
          </label>
          <label class="field">
            <span>{{ 'mobile_number' | t }}</span>
            <input type="tel" [(ngModel)]="form.phone" name="phone" [disabled]="submitting" />
          </label>
          <label class="field">
            <span>{{ 'academy_id_opt' | t }}</span>
            <input type="text" [(ngModel)]="form.academyDataId" name="academyDataId" [disabled]="submitting" placeholder="GUID (اختياري)" />
          </label>
          <label class="field">
            <span>{{ 'branch_id_opt' | t }}</span>
            <input type="text" [(ngModel)]="form.branchCodeId" name="branchCodeId" [disabled]="submitting" placeholder="GUID (اختياري)" />
          </label>
          <label class="field">
            <span>{{ 'password_label' | t }}</span>
            <input type="password" [(ngModel)]="form.password" name="password" [disabled]="submitting" required />
          </label>
          <label class="field">
            <span>{{ 'confirm_password' | t }}</span>
            <input type="password" [(ngModel)]="form.confirm" name="confirm" [disabled]="submitting" required />
          </label>
        </div>
        <div class="actions">
          <button type="submit" class="primary" [disabled]="submitting">{{ submitting ? ('registering' | t) : ('register_now' | t) }}</button>
          <a routerLink="/" class="ghost">{{ 'back_home' | t }}</a>
        </div>
      </form>
    </div>
  </section>
  `,
  styles: [`
  :host{display:block}
  .container{max-width:1200px;width:95%;margin-inline:auto}
  .register-hero{margin-inline:calc(50% - 50vw);width:100vw;background:#2f4756;color:#fff;padding:40px 0 46px;text-align:center}
  .register-hero .title{margin:0 0 8px;font-size:34px}
  .register-hero .subtitle{margin:0;opacity:.9}

  /* خلفية موحّدة اللون عبر الصفحة بالكامل (تكسر حدود الـ container العام) */
  .register-wrap{padding:40px 0 80px;background:#2f4756;margin-inline:calc(50% - 50vw);width:100vw}
  /* لوحة النموذج بدرجة أفتح قليلًا وشفافية خفيفة */
  .card{background:rgba(255,255,255,0.09);border:1px solid rgba(255,255,255,.45);box-shadow:0 10px 24px rgba(0,0,0,.35);border-radius:18px;padding:24px;backdrop-filter:saturate(120%) blur(2px);color:#e8eef3}
  .alert{padding:10px;border-radius:8px;margin-bottom:12px}
  .alert.error{border:1px solid #fecaca;background:#fef2f2;color:#991b1b}
  .alert.success{border:1px solid #bbf7d0;background:#f0fdf4;color:#166534}
  .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
  .field{display:flex;flex-direction:column;gap:8px}
  .field span{color:#e8eef3;font-weight:800}
  .field input{padding:12px 16px;border:1px solid rgba(255,255,255,.45);border-radius:20px;background:rgba(255,255,255,.06);outline:none;color:#eaf2f7}
  .field input::placeholder{color:rgba(255,255,255,.75)}
  .field input:focus{border-color:rgba(255,255,255,.8);box-shadow:0 0 0 3px rgba(255,255,255,.18)}
  .actions{display:flex;gap:12px;justify-content:flex-start;margin-top:16px}
  .primary{padding:12px 18px;border-radius:14px;border:none;background:linear-gradient(135deg,#0d6efd,#0b5ed7);color:#fff;font-weight:800;cursor:pointer}
  .primary:hover{filter:brightness(.98)}
  .ghost{padding:12px 16px;border-radius:12px;border:1px solid #b6c2cf;color:#0d6efd;background:#fff;text-decoration:none;font-weight:700}
  .ghost:hover{background:#f3f7ff}
  @media (max-width: 700px){
    .grid{grid-template-columns:1fr}
  }
  `]
})
export class RegisterComponent {
  form = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    academyDataId: environment.academyId || '',
    branchCodeId: '',
    password: '',
    confirm: ''
  };
  submitting = false;
  error: string | null = null;
  success: string | null = null;

  constructor(private api: ApiService, private router: Router, private auth: AuthService) {}

  submit(){
    this.error = null;
    this.success = null;
    if (!this.form.firstName || !this.form.lastName || !this.form.email || !this.form.password || !this.form.confirm) {
      this.error = ('required_fields_error' as any) as string;
      return;
    }
    // Academy ID and branch ID are now optional
    if (this.form.password !== this.form.confirm) {
      this.error = ('passwords_mismatch' as any) as string;
      return;
    }
    this.submitting = true;
    // استخدم الحقول المطلوبة حسب API التسجيل
    const payload: any = {
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
      password: this.form.password,
      confirmPassword: this.form.confirm,
      phoneNumber: this.form.phone || '',
      academyDataId: this.form.academyDataId || '',
      branchesDataId: this.form.branchCodeId || '',
      role: 'Student' // تحديد دور افتراضي للطالب
    };
    
    // إزالة الحقول الفارغة أو غير الصحيحة لتجنب مشاكل التحقق
    Object.keys(payload).forEach(key => {
      if (payload[key] === '' || payload[key] === null || payload[key] === 'id') {
        delete payload[key];
      }
    });
    
    console.log('Sending registration payload:', JSON.stringify(payload, null, 2));
    this.api.register(payload).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.success = ('register_success' as any) as string;
        // بعض الـ APIs لا ترجع توكن في التسجيل، لذا نسجّل الدخول مباشرة
        this.api.login({ email: this.form.email, password: this.form.password }).subscribe({
          next: (resp) => {
            console.log('Login successful:', resp);
            const token = this.extractToken(resp);
            if (token) {
              // Store via AuthService so header updates immediately
              this.auth.setToken(token);
            }
            this.router.navigateByUrl('/');
          },
          error: (loginErr) => {
            console.error('Auto-login failed:', loginErr);
            // لو فشل تسجيل الدخول التلقائي، نوجّه المستخدم لصفحة الدخول
            this.router.navigateByUrl('/login');
          }
        });
      },
      error: (err) => {
        console.error('register error', err);
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
          url: err.url
        });
        // حاول استخراج رسائل التحقق التفصيلية من الخادم
        const serverMsg = this.extractServerErrors(err?.error) || this.extractServerErrors(err);
        
        // رسائل خطأ محددة حسب رمز الاستجابة
        if (err.status === 400) {
          this.error = serverMsg || 'بيانات غير صحيحة. تحقق من جميع الحقول المطلوبة.';
        } else if (err.status === 401) {
          this.error = 'غير مخول للوصول. تحقق من إعدادات الخادم.';
        } else if (err.status === 409) {
          this.error = 'البريد الإلكتروني مستخدم بالفعل. جرب بريدًا آخر.';
        } else {
          this.error = serverMsg || 'فشل إنشاء الحساب. تحقق من البيانات أو جرّب بريدًا آخر.';
        }
      },
      complete: () => {
        this.submitting = false;
      }
    });
  }

  private extractToken(resp: any): string | null {
    if (!resp) return null;
    return resp.token || resp.accessToken || resp.jwt || resp.idToken || resp?.data?.token || null;
  }

  private extractServerErrors(errBody: any): string | null {
    if (!errBody) return null;
    // حالات شائعة: { message }, { error: '...' }, { errors: { field: [..] } } أو modelState
    if (typeof errBody === 'string') return errBody;
    if (errBody.message) return errBody.message;
    if (errBody.error && typeof errBody.error === 'string') return errBody.error;
    const errors = errBody.errors || errBody.ModelState || errBody.modelState;
    if (errors && typeof errors === 'object') {
      const parts: string[] = [];
      for (const k of Object.keys(errors)) {
        const v = errors[k];
        if (Array.isArray(v)) parts.push(...v);
        else if (typeof v === 'string') parts.push(v);
      }
      if (parts.length) return parts.join(' | ');
    }
    return null;
  }
}
