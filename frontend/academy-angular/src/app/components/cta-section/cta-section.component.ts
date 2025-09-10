import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-cta-section',
  template: `
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="academy-gradient rounded-2xl p-10 md:p-14 text-white relative overflow-hidden">
          <!-- عناصر زخرفية -->
          <div class="absolute top-0 left-0 w-full h-full">
            <div class="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div class="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
            <div class="absolute top-1/2 left-1/4 w-12 h-12 bg-white/5 rounded-full blur-lg"></div>
          </div>
          
          <div class="relative z-10">
            <div class="flex flex-col md:flex-row items-center md:items-center gap-8 md:gap-12">
              <div class="text-center md:text-right flex-1">
                <h3 class="text-2xl md:text-4xl font-bold mb-4 leading-tight">{{ 'cta_title' | t }}</h3>
                <p class="text-white/90 text-lg mb-6 leading-relaxed">{{ 'cta_subtitle' | t }}</p>
                
                <!-- معلومات إضافية -->
                <div class="grid grid-cols-2 gap-4 mb-6 max-w-md mx-auto md:mx-0">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-white mb-1">50,000+</div>
                    <div class="text-white/70 text-sm">{{ 'students_registered' | t }}</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-white mb-1">300+</div>
                    <div class="text-white/70 text-sm">{{ 'training_courses' | t }}</div>
                  </div>
                </div>
              </div>
              
              <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-end w-full md:w-auto">
                <button 
                  (click)="handleSignupClick()"
                  class="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold px-8 py-4 rounded-lg">
                  {{ getSignupText() }}
                  <svg class="mr-2 h-5 w-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                </button>
                <button 
                  (click)="goToAbout()" 
                  class="bg-white/20 text-white hover:bg-white/30 border border-white/40 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm font-semibold px-8 py-4 rounded-lg">
                  <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ 'about_us_btn' | t }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .py-16 { padding: 4rem 0; }
    .max-w-7xl { max-width: 80rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .sm\\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .lg\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
    .academy-gradient {
      background: linear-gradient(135deg, #316591 0%, #3E79AD 100%);
    }
    .rounded-2xl { border-radius: 1rem; }
    .p-10 { padding: 2.5rem; }
    .md\\:p-14 { padding: 3.5rem; }
    .text-white { color: #ffffff; }
    .relative { position: relative; }
    .overflow-hidden { overflow: hidden; }
    .absolute { position: absolute; }
    .top-0 { top: 0; }
    .left-0 { left: 0; }
    .w-full { width: 100%; }
    .h-full { height: 100%; }
    .top-4 { top: 1rem; }
    .right-4 { right: 1rem; }
    .w-20 { width: 5rem; }
    .h-20 { height: 5rem; }
    .bg-white\\/10 { background-color: rgba(255, 255, 255, 0.1); }
    .rounded-full { border-radius: 9999px; }
    .blur-xl { filter: blur(24px); }
    .bottom-4 { bottom: 1rem; }
    .left-4 { left: 1rem; }
    .w-16 { width: 4rem; }
    .h-16 { height: 4rem; }
    .top-1\\/2 { top: 50%; }
    .left-1\\/4 { left: 25%; }
    .w-12 { width: 3rem; }
    .h-12 { height: 3rem; }
    .bg-white\\/5 { background-color: rgba(255, 255, 255, 0.05); }
    .blur-lg { filter: blur(16px); }
    .z-10 { z-index: 10; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .md\\:flex-row { flex-direction: row; }
    .items-center { align-items: center; }
    .md\\:items-center { align-items: center; }
    .gap-8 { gap: 2rem; }
    .md\\:gap-12 { gap: 3rem; }
    .text-center { text-align: center; }
    .md\\:text-right { text-align: right; }
    .flex-1 { flex: 1 1 0%; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .md\\:text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
    .font-bold { font-weight: 700; }
    .mb-4 { margin-bottom: 1rem; }
    .leading-tight { line-height: 1.25; }
    .text-white\\/90 { color: rgba(255, 255, 255, 0.9); }
    .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .leading-relaxed { line-height: 1.625; }
    .grid { display: grid; }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .gap-4 { gap: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .max-w-md { max-width: 28rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .md\\:mx-0 { margin-left: 0; margin-right: 0; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .font-bold { font-weight: 700; }
    .text-white { color: #ffffff; }
    .mb-1 { margin-bottom: 0.25rem; }
    .text-white\\/70 { color: rgba(255, 255, 255, 0.7); }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .sm\\:flex-row { flex-direction: row; }
    .justify-center { justify-content: center; }
    .md\\:justify-end { justify-content: flex-end; }
    .w-full { width: 100%; }
    .md\\:w-auto { width: auto; }
    .bg-white { background-color: #ffffff; }
    .text-primary { color: var(--primary); }
    .hover\\:bg-white\\/90:hover { background-color: rgba(255, 255, 255, 0.9); }
    .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
    .hover\\:shadow-xl:hover { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
    .transform { transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
    .hover\\:scale-105:hover { --tw-scale-x: 1.05; --tw-scale-y: 1.05; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
    .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .duration-300 { transition-duration: 300ms; }
    .font-semibold { font-weight: 600; }
    .px-8 { padding-left: 2rem; padding-right: 2rem; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .rounded-lg { border-radius: 0.5rem; }
    .mr-2 { margin-right: 0.5rem; }
    .h-5 { height: 1.25rem; }
    .w-5 { width: 1.25rem; }
    .inline { display: inline; }
    .bg-white\\/20 { background-color: rgba(255, 255, 255, 0.2); }
    .text-white { color: #ffffff; }
    .hover\\:bg-white\\/30:hover { background-color: rgba(255, 255, 255, 0.3); }
    .border { border-width: 1px; }
    .border-white\\/40 { border-color: rgba(255, 255, 255, 0.4); }
    .backdrop-blur-sm { backdrop-filter: blur(4px); }

    @media (max-width: 640px) {
      .sm\\:px-6 { padding-left: 1rem; padding-right: 1rem; }
      .sm\\:flex-row { flex-direction: column; }
    }

    @media (max-width: 768px) {
      .md\\:p-14 { padding: 2.5rem; }
      .md\\:flex-row { flex-direction: column; }
      .md\\:text-right { text-align: center; }
      .md\\:items-center { align-items: center; }
      .md\\:gap-12 { gap: 2rem; }
      .md\\:mx-0 { margin-left: auto; margin-right: auto; }
      .md\\:justify-end { justify-content: center; }
      .md\\:w-auto { width: 100%; }
    }

    @media (max-width: 1024px) {
      .lg\\:px-8 { padding-left: 1.5rem; padding-right: 1.5rem; }
    }
  `]
})
export class CTASectionComponent implements OnInit {
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(authenticated => {
      this.isAuthenticated = authenticated;
    });
  }

  handleSignupClick() {
    if (this.isAuthenticated) {
      window.location.href = '/account';
    } else {
      window.location.href = '/register';
    }
  }

  getSignupText() {
    if (this.isAuthenticated) {
      return this.languageService.current === 'ar' ? 'حسابي' : 'My Account';
    }
    return this.languageService.current === 'ar' ? 'سجل الآن' : 'Register Now';
  }

  goToAbout() {
    window.location.href = '/about';
  }
}
