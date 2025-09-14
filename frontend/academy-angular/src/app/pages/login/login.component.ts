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
    // Try common shapes first
    const direct = resp.token || resp.accessToken || resp.access_token || resp.jwt || resp.idToken || resp?.data?.token || resp?.result?.token;
    if (typeof direct === 'string') return direct;
    // Fallback: deep-search for a JWT-looking string anywhere in the object
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    const stack: any[] = [resp];
    const seen = new Set<any>();
    while (stack.length) {
      const cur = stack.pop();
      if (!cur || seen.has(cur)) continue;
      seen.add(cur);
      if (typeof cur === 'string' && jwtRegex.test(cur)) return cur;
      if (typeof cur === 'object') {
        for (const k of Object.keys(cur)) {
          const v: any = (cur as any)[k];
          if (typeof v === 'string' && (k.toLowerCase().includes('token') || jwtRegex.test(v))) {
            if (jwtRegex.test(v)) return v;
          }
          if (v && (typeof v === 'object' || Array.isArray(v))) stack.push(v);
        }
      }
      if (Array.isArray(cur)) stack.push(...cur);
    }
    return null;
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
        // Optionally store refresh token if present
        const refresh = (resp && (resp.refreshToken || resp.refresh_token || resp?.data?.refreshToken)) as string | undefined;
        if (refresh) localStorage.setItem('refresh_token', refresh);
        // Fetch current user and student data to initialize session context
        this.api.accountMe().subscribe({
          next: (me) => {
            try {
              if (me) localStorage.setItem('profileData', JSON.stringify(me));
            } catch {}
            // Load StudentData and store current student's record if any
            this.api.getStudentData().subscribe({
              next: (students) => {
                try {
                  const email = (me?.email || me?.Email || this.email || '').toLowerCase();
                  const match = Array.isArray(students)
                    ? students.find((s: any) => {
                        const semail = (s.email || s.Email || s.studentEmail || s.StudentEmail || '').toLowerCase();
                        return semail && email && semail === email;
                      })
                    : null;
                  if (match) {
                    localStorage.setItem('studentData', JSON.stringify(match));
                  } else {
                    // Auto-create minimal StudentData so other components can recognize the session
                    const fullName = me?.fullName || me?.name || (me?.given_name && me?.family_name ? `${me.given_name} ${me.family_name}` : '') || this.email;
                    // Try to resolve academy/branch from localStorage (if previously cached)
                    let academyId = '';
                    let branchId = '';
                    try {
                      const social = localStorage.getItem('userSocialMedia');
                      if (social) {
                        const js = JSON.parse(social);
                        academyId = js?.academyDataId || js?.AcademyDataId || '';
                        branchId = js?.branchesDataId || js?.BranchesDataId || '';
                      }
                      // If not found, try studentData cache
                      if (!academyId || !branchId) {
                        const sdRaw = localStorage.getItem('studentData');
                        if (sdRaw) {
                          const sd = JSON.parse(sdRaw);
                          academyId = academyId || sd?.academyDataId || sd?.AcademyDataId || '';
                          branchId = branchId || sd?.branchesDataId || sd?.BranchesDataId || '';
                        }
                      }
                    } catch {}
                    const payload: any = {
                      studentNameL1: fullName || 'User',
                      studentNameL2: fullName || 'User',
                      studentEmail: me?.email || me?.Email || this.email,
                      studentPhone: '',
                      language: 'ar',
                      studentAddress: 'N/A',
                      trainingProvider: 'Academy System',
                      academyDataId: academyId || undefined,
                      branchesDataId: branchId || undefined
                    };
                    this.api.createStudentData(payload).subscribe({
                      next: (created) => {
                        try { if (created) localStorage.setItem('studentData', JSON.stringify(created)); } catch {}
                        // Notify listeners (header) that student data has changed
                        try { window.dispatchEvent(new CustomEvent('student-data-changed')); } catch {}
                      },
                      error: () => {
                        // ignore create error; user can create later from /account
                      }
                    });
                  }
                } catch {}
                // Navigate to home after initializing session context
                this.router.navigateByUrl('/');
              },
              error: () => {
                // Navigate anyway if students fetch fails
                this.router.navigateByUrl('/');
              }
            });
          },
          error: () => {
            // Navigate if accountMe fails
            this.router.navigateByUrl('/');
          }
        });
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
