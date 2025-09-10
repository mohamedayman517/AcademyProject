import { Component } from '@angular/core';

@Component({
  selector: 'app-student-dashboard',
  template: `
    <section class="container" dir="rtl">
      <div class="hero">
        <div class="hero-content">
          <h1>لوحة الطالب</h1>
          <p>نظرة عامة سريعة على الحضور والتقييمات.</p>
        </div>
      </div>

      <div class="grid">
        <div class="card">
          <h3 class="card-title">الحضور</h3>
          <app-student-attendance></app-student-attendance>
        </div>
        <div class="card">
          <h3 class="card-title">التقييمات</h3>
          <app-student-evaluations></app-student-evaluations>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host ::ng-deep app-student-attendance .hero{display:none}
    :host ::ng-deep app-student-evaluations .hero{display:none}
    .container{padding:24px}
    .hero{background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:16px;padding:18px;color:#fff;margin-bottom:12px}
    .grid{display:grid;grid-template-columns:1fr;gap:12px}
    @media(min-width: 980px){ .grid{grid-template-columns:1fr 1fr} }
    .card{border:1px solid #eef0f4;border-radius:12px;background:#fff}
    .card-title{margin:0;padding:12px;border-bottom:1px solid #eef0f4}
  `]
})
export class StudentDashboardComponent {}
