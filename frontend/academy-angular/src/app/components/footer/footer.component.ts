import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-footer',
  template: `
  <footer class="site-footer" dir="rtl">
    <div class="container top">
      <div class="col about">
        <div class="brand">
          <img src="/assets/images/academy_logo-D0oHkb2u.png" [alt]="'company' | t" />
        </div>
        <p class="desc">{{ description || ('footer_desc' | t) }}</p>
        <div class="stats">
          <div class="stat"><strong>{{ studentsCount || '50,000+' }}</strong><span>{{ 'students_registered' | t }}</span></div>
          <div class="stat"><strong>{{ coursesCount || '300+' }}</strong><span>{{ 'training_courses' | t }}</span></div>
          <div class="stat"><strong>{{ certificatesCount || '1,000+' }}</strong><span>{{ 'certified_count' | t }}</span></div>
        </div>
        <ul class="contact">
          <li>
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6.6 10.8c1.5 3 3.6 5.1 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.2 1.3.5 2.7.8 4.1.8.7 0 1.3.6 1.3 1.3v3.5c0 .7-.6 1.3-1.3 1.3C9.7 22 2 14.3 2 4.3 2 3.6 2.6 3 3.3 3H6.8c.7 0 1.3.6 1.3 1.3 0 1.4.3 2.8.8 4.1.1.4 0 .9-.3 1.2L6.6 10.8z" fill="#0f1720"/></svg>
            <span>{{ phone || '+966 11 123 4567' }}</span>
          </li>
          <li>
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2l8 6 8-6" fill="none" stroke="#0f1720" stroke-width="1.6"/></svg>
            <span>{{ email || 'info\u0040academy-creativity.com' }}</span>
          </li>
          <li>
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 2C7 2 3 6 3 11c0 7 9 11 9 11s9-4 9-11c0-5-4-9-9-9zm0 5a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" fill="#0f1720"/></svg>
            <span>{{ address || 'الرياض، المملكة العربية السعودية' }}</span>
          </li>
        </ul>
      </div>

      <div class="col">
        <h4>{{ 'company' | t }}</h4>
        <ul>
          <li><a href="#">{{ 'about_us' | t }}</a></li>
          <li><a href="#">{{ 'team' | t }}</a></li>
          <li><a href="#">{{ 'partners' | t }}</a></li>
          <li><a routerLink="/careers">{{ 'careers' | t }}</a></li>
          <li><a href="#">{{ 'news' | t }}</a></li>
        </ul>
      </div>

      <div class="col">
        <h4>{{ 'services' | t }}</h4>
        <ul>
          <li><a href="#">{{ 'certified_certificates' | t }}</a></li>
          <li><a href="#">{{ 'corporate_training' | t }}</a></li>
          <li><a href="#">{{ 'edu_consulting' | t }}</a></li>
          <li><a href="#">{{ 'scholarships' | t }}</a></li>
          <li><a href="#">{{ 'support' | t }}</a></li>
        </ul>
      </div>

      <div class="col">
        <h4>{{ 'courses_programs' | t }}</h4>
        <ul>
          <li><a href="#">{{ 'technology' | t }}</a></li>
          <li><a href="#">{{ 'business' | t }}</a></li>
          <li><a href="#">{{ 'design_creativity' | t }}</a></li>
          <li><a href="#">{{ 'languages_lbl' | t }}</a></li>
          <li><a href="#">{{ 'self_development' | t }}</a></li>
        </ul>
        <h4 class="mt">{{ 'help_lbl' | t }}</h4>
        <ul>
          <li><a href="#">{{ 'help_center' | t }}</a></li>
          <li><a href="#">{{ 'faq' | t }}</a></li>
          <li><a href="#">{{ 'privacy_policy' | t }}</a></li>
          <li><a href="#">{{ 'terms' | t }}</a></li>
          <li><a routerLink="/contact">{{ 'contact_us' | t }}</a></li>
        </ul>
      </div>
    </div>

    <div class="container bottom">
      <div class="copy">{{ ('copyright' | t).replace('{{year}}', year) }}</div>
      <div class="social">
        <a aria-label="Twitter" href="#">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M22 5.9c-.7.3-1.5.6-2.3.7.8-.5 1.4-1.2 1.7-2.1-.7.5-1.6.8-2.5 1-1.4-1.5-3.7-1.6-5.1-.1-1 1-1.3 2.4-.9 3.7-3.1-.2-5.9-1.6-7.8-3.9-1 1.8-.5 4.1 1.2 5.2-.6 0-1.2-.2-1.7-.5 0 1.9 1.3 3.6 3.2 4-.6.2-1.3.2-1.9.1.5 1.6 2 2.7 3.7 2.7-1.6 1.2-3.6 1.9-5.6 1.9H2c2 1.3 4.4 2 6.9 2 8.3 0 12.9-6.9 12.9-12.9v-.6c.9-.6 1.6-1.3 2.2-2.2z" fill="#0f1720"/></svg>
        </a>
        <a aria-label="Facebook" href="#">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M13 3h4v4h-4v4h4v10h-4v-6h-3v-4h3V7a4 4 0 0 1 4-4z" fill="#0f1720"/></svg>
        </a>
        <a aria-label="Instagram" href="#">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" fill="#0f1720"/></svg>
        </a>
        <a aria-label="LinkedIn" href="#">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM3 8h3v13H3zM10 8h3v2h.1c.4-.8 1.5-1.6 3-1.6 3.2 0 3.9 2.1 3.9 4.8V21h-3v-6c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V21H10V8z" fill="#0f1720"/></svg>
        </a>
      </div>
    </div>
  </footer>
  `,
  styles: [`
    :host{display:block}
    .site-footer{
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-top: 1px solid #e5eaf0;
      color: #0f1720;
      position: relative;
      overflow: hidden;
    }
    .site-footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #2A76D2 0%, #4A90E2 50%, #2A76D2 100%);
      background-size: 200% 100%;
      animation: shimmer 4s ease-in-out infinite;
    }
    .container{max-width:1200px;width:95%;margin:0 auto;position:relative;z-index:1}
    .top{display:grid;grid-template-columns:2fr 1fr 1fr 1.2fr;gap:40px;padding:50px 0 30px}
    .brand img{width:65px;height:auto;filter: drop-shadow(0 2px 8px rgba(42, 118, 210, 0.2));transition: all 0.3s ease}
    .brand img:hover{transform: scale(1.05);filter: drop-shadow(0 4px 12px rgba(42, 118, 210, 0.3))}
    .about .desc{margin:16px 0 20px;color:#4b5563;line-height:1.7;font-size:15px}
    .stats{display:flex;gap:24px;flex-wrap:wrap;margin:20px 0 24px}
    .stat{display:flex;flex-direction:column;padding:16px;background:rgba(42, 118, 210, 0.05);border-radius:12px;transition: all 0.3s ease;min-width:120px}
    .stat:hover{background:rgba(42, 118, 210, 0.1);transform: translateY(-2px)}
    .stat strong{font-size:20px;color:#2A76D2;font-weight:700}
    .stat span{color:#6b7280;font-size:13px;margin-top:4px}
    .contact{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px;color:#1f2937}
    .contact li{display:flex;align-items:center;gap:12px;padding:8px 0;transition: all 0.3s ease;border-radius:8px}
    .contact li:hover{background:rgba(42, 118, 210, 0.05);padding:8px 12px}

    .col h4{margin:0 0 16px;font-size:18px;color:#2A76D2;font-weight:700;position:relative}
    .col h4::after{content:'';position:absolute;bottom:-6px;left:0;width:30px;height:3px;background:linear-gradient(90deg, #2A76D2 0%, #4A90E2 100%);border-radius:2px}
    .col ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
    .col a{color:#374151;text-decoration:none;padding:8px 0;transition: all 0.3s ease;border-radius:6px;display:block}
    .col a:hover{color:#2A76D2;background:rgba(42, 118, 210, 0.08);padding:8px 12px;transform: translateX(5px)}
    .col .mt{margin-top:24px}

    .bottom{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #e5eaf0;padding:20px 0;background:rgba(42, 118, 210, 0.02)}
    .copy{color:#6b7280;font-size:14px}
    .social{display:flex;gap:16px}
    .social a{
      display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;
      border:2px solid #e5eaf0;border-radius:12px;transition: all 0.3s ease;
      background:rgba(255, 255, 255, 0.8);backdrop-filter: blur(5px)
    }
    .social a:hover{
      border-color:#2A76D2;background:#2A76D2;color:white;transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(42, 118, 210, 0.3)
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    @media (max-width: 900px){
      .top{grid-template-columns:1fr 1fr;gap:30px;padding:40px 0 25px}
      .stats{gap:16px}
      .stat{min-width:100px;padding:12px}
    }
    @media (max-width: 600px){
      .top{grid-template-columns:1fr;gap:25px;padding:30px 0 20px}
      .bottom{flex-direction:column;gap:15px;text-align:center}
      .stats{justify-content:center}
    }
  `]
})
export class FooterComponent implements OnInit {
  year = new Date().getFullYear();

  // Dynamic fields with sensible fallbacks
  description = '';
  phone = '';
  email = '';
  address = '';
  studentsCount: string | number | undefined;
  coursesCount: string | number | undefined;
  certificatesCount: string | number | undefined;

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    // Use development token for testing if available
    this.auth.useDevToken();
    
    const academyId = (environment.academyId || '').trim();
    const isGuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(academyId);
    const source$ = isGuid
      ? this.api.getAcademyDataById(academyId)
      : this.api.getAcademyData();

    source$.subscribe({
      next: (data) => {
        const item = Array.isArray(data) ? (data[0] ?? {}) : (data || {});

        // Try common field names safely
        this.description = item.description || item.about || '';
        this.phone = item.phone || item.mobile || item.contactPhone || '';
        this.email = item.email || item.contactEmail || '';
        this.address = item.address || item.location || '';

        // Stats (if available)
        this.studentsCount = item.studentsCount || item.students || item.stats?.students;
        this.coursesCount = item.coursesCount || item.courses || item.stats?.courses;
        this.certificatesCount = item.certificatesCount || item.certificates || item.stats?.certificates;
      },
      error: () => {
        // keep fallbacks silently
      }
    });
  }
}
