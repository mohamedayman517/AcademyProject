import { Component } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-features',
  template: `
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl lg:text-4xl font-bold text-foreground mb-3">{{ 'features_title' | t }}</h2>
          <p class="text-muted-foreground max-w-2xl mx-auto">{{ 'features_subtitle' | t }}</p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div *ngFor="let feature of features; let i = index" 
               class="group relative bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all"
               [@slideInUp]="'in'">
            <div class="mb-4 inline-flex p-3 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
              <svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path *ngIf="feature.icon === 'rocket'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                <path *ngIf="feature.icon === 'shield'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                <path *ngIf="feature.icon === 'sparkles'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                <path *ngIf="feature.icon === 'headphones'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-foreground mb-2">{{ feature.title | t }}</h3>
            <p class="text-sm text-muted-foreground leading-relaxed">{{ feature.desc | t }}</p>
          </div>
        </div>
        
        <!-- قسم عنّا محسن -->
        <div class="text-center mt-20">
          <div class="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl p-10 border border-primary/20 shadow-xl backdrop-blur-sm">
            <div class="max-w-4xl mx-auto">
              <div class="flex justify-center mb-6">
                <div class="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              
              <h3 class="text-3xl font-bold text-foreground mb-6">{{ 'about_us_title' | t }}</h3>
              
              <p class="text-lg text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
                {{ 'about_us_desc' | t }}
              </p>
              
              <div class="grid md:grid-cols-2 gap-8 mb-10">
                <div class="text-center">
                  <div class="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                    </svg>
                  </div>
                  <h4 class="text-lg font-semibold text-foreground mb-2">{{ 'about_initiative_title' | t }}</h4>
                  <p class="text-sm text-muted-foreground leading-relaxed">
                    {{ 'about_initiative_desc' | t }}
                  </p>
                </div>
                
                <div class="text-center">
                  <div class="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                  </div>
                  <h4 class="text-lg font-semibold text-foreground mb-2">{{ 'about_academy_title' | t }}</h4>
                  <p class="text-sm text-muted-foreground leading-relaxed">
                    {{ 'about_academy_desc' | t }}
                  </p>
                </div>
              </div>
              
              <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  (click)="goToAbout()" 
                  class="rounded-full px-10 py-4 text-lg bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-white">
                  <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ 'about_us_btn' | t }}
                </button>
                
                <button 
                  (click)="goToTrainers()" 
                  class="rounded-full px-10 py-4 text-lg border-2 border-primary/30 text-primary hover:bg-primary/10 transition-all duration-300 font-semibold">
                  <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                  {{ 'trainers_btn' | t }}
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
    .text-center { text-align: center; }
    .mb-12 { margin-bottom: 3rem; }
    .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
    .lg\\:text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
    .font-bold { font-weight: 700; }
    .text-foreground { color: var(--foreground); }
    .mb-3 { margin-bottom: 0.75rem; }
    .text-muted-foreground { color: var(--muted-foreground); }
    .max-w-2xl { max-width: 42rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .grid { display: grid; }
    .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .gap-6 { gap: 1.5rem; }
    .group { position: relative; }
    .relative { position: relative; }
    .bg-card { background-color: var(--card); }
    .border { border-width: 1px; }
    .border-border { border-color: var(--border); }
    .rounded-xl { border-radius: 0.75rem; }
    .p-6 { padding: 1.5rem; }
    .hover\\:shadow-md:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .mb-4 { margin-bottom: 1rem; }
    .inline-flex { display: inline-flex; }
    .p-3 { padding: 0.75rem; }
    .rounded-lg { border-radius: 0.5rem; }
    .bg-primary\\/10 { background-color: rgba(49, 101, 145, 0.1); }
    .group-hover\\:bg-primary\\/15:hover { background-color: rgba(49, 101, 145, 0.15); }
    .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .h-6 { height: 1.5rem; }
    .w-6 { width: 1.5rem; }
    .text-primary { color: var(--primary); }
    .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .font-semibold { font-weight: 600; }
    .text-foreground { color: var(--foreground); }
    .mb-2 { margin-bottom: 0.5rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-muted-foreground { color: var(--muted-foreground); }
    .leading-relaxed { line-height: 1.625; }
    .mt-20 { margin-top: 5rem; }
    .bg-gradient-to-br { background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
    .from-primary\\/10 { --tw-gradient-from: rgba(49, 101, 145, 0.1); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(49, 101, 145, 0)); }
    .via-primary\\/5 { --tw-gradient-to: rgba(49, 101, 145, 0.05); }
    .to-transparent { --tw-gradient-to: transparent; }
    .rounded-3xl { border-radius: 1.5rem; }
    .p-10 { padding: 2.5rem; }
    .border { border-width: 1px; }
    .border-primary\\/20 { border-color: rgba(49, 101, 145, 0.2); }
    .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
    .backdrop-blur-sm { backdrop-filter: blur(4px); }
    .max-w-4xl { max-width: 56rem; }
    .flex { display: flex; }
    .justify-center { justify-content: center; }
    .mb-6 { margin-bottom: 1.5rem; }
    .w-16 { width: 4rem; }
    .h-16 { height: 4rem; }
    .bg-primary\\/20 { background-color: rgba(49, 101, 145, 0.2); }
    .rounded-full { border-radius: 9999px; }
    .items-center { align-items: center; }
    .w-8 { width: 2rem; }
    .h-8 { height: 2rem; }
    .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
    .mb-8 { margin-bottom: 2rem; }
    .max-w-3xl { max-width: 48rem; }
    .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .gap-8 { gap: 2rem; }
    .mb-10 { margin-bottom: 2.5rem; }
    .w-12 { width: 3rem; }
    .h-12 { height: 3rem; }
    .bg-blue-500\\/20 { background-color: rgba(59, 130, 246, 0.2); }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .mb-4 { margin-bottom: 1rem; }
    .text-blue-500 { color: #3b82f6; }
    .text-green-500 { color: #10b981; }
    .bg-green-500\\/20 { background-color: rgba(16, 185, 129, 0.2); }
    .sm\\:flex-row { flex-direction: row; }
    .gap-4 { gap: 1rem; }
    .justify-center { justify-content: center; }
    .items-center { align-items: center; }
    .bg-primary { background-color: var(--primary); }
    .hover\\:bg-primary\\/90:hover { background-color: rgba(49, 101, 145, 0.9); }
    .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
    .hover\\:shadow-xl:hover { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
    .transform { transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
    .hover\\:scale-105:hover { --tw-scale-x: 1.05; --tw-scale-y: 1.05; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
    .duration-300 { transition-duration: 300ms; }
    .font-semibold { font-weight: 600; }
    .text-white { color: #ffffff; }
    .border-2 { border-width: 2px; }
    .border-primary\\/30 { border-color: rgba(49, 101, 145, 0.3); }
    .text-primary { color: var(--primary); }
    .hover\\:bg-primary\\/10:hover { background-color: rgba(49, 101, 145, 0.1); }
    .inline { display: inline; }
    .mr-2 { margin-right: 0.5rem; }

    @media (max-width: 640px) {
      .sm\\:px-6 { padding-left: 1rem; padding-right: 1rem; }
      .sm\\:grid-cols-2 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
      .sm\\:flex-row { flex-direction: column; }
    }

    @media (max-width: 1024px) {
      .lg\\:px-8 { padding-left: 1.5rem; padding-right: 1.5rem; }
      .lg\\:text-4xl { font-size: 1.875rem; line-height: 2.25rem; }
      .lg\\:grid-cols-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
  `],
  animations: [
    trigger('slideInUp', [
      state('in', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('void => *', [
        style({
          opacity: 0,
          transform: 'translateY(20px)'
        }),
        animate('0.6s ease-out')
      ])
    ])
  ]
})
export class FeaturesComponent {
  features = [
    {
      icon: 'rocket',
      title: 'feature_1_title',
      desc: 'feature_1_desc'
    },
    {
      icon: 'shield',
      title: 'feature_2_title',
      desc: 'feature_2_desc'
    },
    {
      icon: 'sparkles',
      title: 'feature_3_title',
      desc: 'feature_3_desc'
    },
    {
      icon: 'headphones',
      title: 'feature_4_title',
      desc: 'feature_4_desc'
    }
  ];

  goToAbout() {
    window.location.href = '/about';
  }

  goToTrainers() {
    window.location.href = '/trainers';
  }
}
