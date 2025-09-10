import { Component, OnInit } from '@angular/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-stats-bar',
  template: `
    <section class="py-10" [attr.dir]="isRTL ? 'rtl' : 'ltr'">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-card border border-border rounded-2xl shadow-sm">
          <div class="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 divide-border" 
               [class.md:divide-x-reverse]="!isRTL"
               [class.md:divide-x]="isRTL">
            <div *ngFor="let stat of stats; let idx = index" 
                 class="flex items-center justify-center gap-3 p-6"
                 [class.flex-row-reverse]="isRTL">
              <div class="p-2.5 rounded-lg bg-primary/10">
                <svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path *ngIf="stat.icon === 'users'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  <path *ngIf="stat.icon === 'book'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  <path *ngIf="stat.icon === 'award'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                  <path *ngIf="stat.icon === 'globe'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                </svg>
              </div>
              <div class="text-center" [class.md:text-start]="!isRTL" [class.md:text-end]="isRTL">
                <div class="text-xl font-bold text-foreground leading-none">{{ stat.value }}</div>
                <div class="text-sm text-muted-foreground mt-1">{{ stat.label | t }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .py-10 { padding: 2.5rem 0; }
    .max-w-7xl { max-width: 80rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .sm\\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .lg\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
    .bg-card { background-color: var(--card); }
    .border { border-width: 1px; }
    .border-border { border-color: var(--border); }
    .rounded-2xl { border-radius: 1rem; }
    .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
    .grid { display: grid; }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .divide-y > :not([hidden]) ~ :not([hidden]) { border-top-width: 1px; }
    .md\\:divide-y-0 > :not([hidden]) ~ :not([hidden]) { border-top-width: 0px; }
    .md\\:divide-x-reverse > :not([hidden]) ~ :not([hidden]) { border-left-width: 1px; border-right-width: 0px; }
    .md\\:divide-x > :not([hidden]) ~ :not([hidden]) { border-right-width: 1px; border-left-width: 0px; }
    .divide-border { border-color: var(--border); }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .gap-3 { gap: 0.75rem; }
    .p-6 { padding: 1.5rem; }
    .p-2\\.5 { padding: 0.625rem; }
    .rounded-lg { border-radius: 0.5rem; }
    .bg-primary\\/10 { background-color: rgba(49, 101, 145, 0.1); }
    .h-6 { height: 1.5rem; }
    .w-6 { width: 1.5rem; }
    .text-primary { color: var(--primary); }
    .text-center { text-align: center; }
    .md\\:text-start { text-align: left; }
    .md\\:text-end { text-align: right; }
    .flex-row-reverse { flex-direction: row-reverse; }
    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .font-bold { font-weight: 700; }
    .text-foreground { color: var(--foreground); }
    .leading-none { line-height: 1; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-muted-foreground { color: var(--muted-foreground); }
    .mt-1 { margin-top: 0.25rem; }

    @media (max-width: 640px) {
      .sm\\:px-6 { padding-left: 1rem; padding-right: 1rem; }
    }

    @media (max-width: 768px) {
      .md\\:grid-cols-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .md\\:divide-y-0 { }
      .md\\:divide-x-reverse { }
      .md\\:text-start { text-align: center; }
      .md\\:text-end { text-align: center; }
    }

    @media (max-width: 1024px) {
      .lg\\:px-8 { padding-left: 1.5rem; padding-right: 1.5rem; }
    }
  `]
})
export class StatsBarComponent implements OnInit {
  isRTL = false;
  
  stats: any[] = [
    { icon: 'users', value: '50,000+', label: 'students_registered' },
    { icon: 'book', value: '300+', label: 'training_courses' },
    { icon: 'award', value: '1,000+', label: 'certified_count' },
    { icon: 'globe', value: '15+', label: 'countries' }
  ];

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.languageService.currentLang$.subscribe(lang => {
      this.isRTL = lang === 'ar';
    });
  }
}
