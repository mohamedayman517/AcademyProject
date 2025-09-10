import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <section class="login-hero" dir="rtl">
      <div class="container">
        <h1 class="title">تسجيل الدخول</h1>
        <p class="subtitle">ادخل بياناتك للوصول إلى حسابك والاستفادة من جميع المزايا</p>
      </div>
    </section>

    <section class="login-wrap" dir="rtl">
      <div class="container">
        <form class="card" (ngSubmit)="submit()" #f="ngForm">
          <div *ngIf="error" class="alert error">{{ error }}</div>
          <label class="field">
            <span>البريد الإلكتروني</span>
            <input name="email" type="email" [(ngModel)]="email" [disabled]="submitting" required />
          </label>
          <label class="field">
            <span>كلمة المرور</span>
            <input name="password" type="password" [(ngModel)]="password" [disabled]="submitting" required />
          </label>
          <div class="actions">
            <button type="submit" class="primary" [disabled]="submitting">{{ submitting ? 'جارٍ الدخول...' : 'دخول' }}</button>
            <a routerLink="/register" class="ghost">إنشاء حساب جديد</a>
          </div>
        </form>
      </div>
    </section>
  `,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  submitting = false;
  error: string | null = null;

  constructor(private api: ApiService, private router: Router, private auth: AuthService) {}

  private extractToken(resp: any): string | null {
    if (!resp) return null;
    // Try common shapes
    return (
      resp.token ||
      resp.accessToken ||
      resp.jwt ||
      resp.idToken ||
      resp?.data?.token ||
      null
    );
  }

  submit(): void {
    this.error = null;
    if (!this.email.trim() || !this.password.trim()) {
      this.error = 'يرجى إدخال البريد وكلمة المرور.';
      return;
    }
    this.submitting = true;
    this.api.login({ email: this.email, password: this.password }).subscribe({
      next: (resp) => {
        const token = this.extractToken(resp);
        if (!token) {
          this.error = 'لم يتم استلام رمز الدخول من الخادم.';
          return;
        }
        // Set token via AuthService so header updates immediately
        this.auth.setToken(token);
        // Navigate to home (or projects) after login
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        console.error('login error', err);
        this.error = 'فشل تسجيل الدخول. تأكد من البيانات وحاول مجدداً.';
      },
      complete: () => {
        this.submitting = false;
      }
    });
  }
}
