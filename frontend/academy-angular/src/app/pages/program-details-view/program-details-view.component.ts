import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-program-details-view',
  template: `
    <section class="relative isolate overflow-hidden" dir="rtl">
      <div class="absolute inset-0 -z-10 animated-gradient opacity-90"></div>
      <div class="absolute inset-0 z-0 bg-black/55"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 lg:py-28 relative z-10">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl sm:text-4xl font-extrabold text-white">تفاصيل البرنامج</h1>
          <div class="program-id text-white/80 text-sm font-mono">المعرف: {{ id || '—' }}</div>
        </div>

        <div *ngIf="loading" class="text-center text-white py-10">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          جاري التحميل...
        </div>
        <div *ngIf="error" class="text-center text-white py-10">
          حدث خطأ: {{ error }}
        </div>

      <ng-container *ngIf="!loading && !error">
          <div *ngIf="program; else notFound" class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 sm:p-6">
            <div class="program-details">
              <div class="program-header mb-6">
                <h2 class="text-2xl font-bold text-white mb-2">
                  {{ program?.programNameL1 || program?.ProgramNameL1 || program?.Title || program?.Name || 'برنامج' }}
                </h2>
                <div *ngIf="program?.programNameL2 || program?.ProgramNameL2" class="program-name-en text-white/80 text-lg italic">
                  {{ program?.programNameL2 || program?.ProgramNameL2 }}
                </div>
              </div>
              
              <div *ngIf="program?.description || program?.Description" class="program-section mb-6">
                <h3 class="text-lg font-semibold text-white mb-3">الوصف:</h3>
                <p class="text-white/90 leading-relaxed">{{ program?.description || program?.Description }}</p>
              </div>

              <div *ngIf="program?.level || program?.Level" class="program-section mb-6">
                <h3 class="text-lg font-semibold text-white mb-3">المستوى:</h3>
                <p class="text-white/90">{{ program?.level || program?.Level }}</p>
              </div>

              <div *ngIf="program?.programMasterId || program?.ProgramMasterId" class="program-section mb-6">
                <h3 class="text-lg font-semibold text-white mb-3">معرف البرنامج الرئيسي:</h3>
                <p class="text-white/90 font-mono text-sm">{{ program?.programMasterId || program?.ProgramMasterId }}</p>
              </div>

            </div>
        </div>
        <ng-template #notFound>
            <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center">
              <div class="text-white/70 text-lg">لا توجد بيانات للبرنامج.</div>
            </div>
        </ng-template>
      </ng-container>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    
    /* Animated gradient and overlay */
    .absolute { position: absolute; }
    .relative { position: relative; }
    .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
    .-z-10 { z-index: -10; }
    .z-0 { z-index: 0; }
    .z-10 { z-index: 10; }
    .opacity-90 { opacity: .9; }
    .bg-black\/55 { background: rgba(0,0,0,.55); }
    .max-w-7xl { max-width: 80rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .sm\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .lg\:px-8 { padding-left: 2rem; padding-right: 2rem; }
    .py-14 { padding-top: 3.5rem; padding-bottom: 3.5rem; }
    .md\:py-20 { padding-top: 5rem; padding-bottom: 5rem; }
    .lg\:py-28 { padding-top: 7rem; padding-bottom: 7rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mt-4 { margin-top: 1rem; }
    .mt-8 { margin-top: 2rem; }
    .pt-6 { padding-top: 1.5rem; }
    .text-white { color: #fff; }
    .text-white\/70 { color: rgba(255,255,255,.7); }
    .text-white\/80 { color: rgba(255,255,255,.8); }
    .text-white\/90 { color: rgba(255,255,255,.9); }
    .text-3xl { font-size: 1.875rem; }
    .sm\:text-4xl { font-size: 2.25rem; }
    .text-2xl { font-size: 1.5rem; }
    .text-lg { font-size: 1.125rem; }
    .text-sm { font-size: 0.875rem; }
    .text-xs { font-size: 0.75rem; }
    .font-extrabold { font-weight: 800; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace; }
    .italic { font-style: italic; }
    .flex { display: flex; }
    .justify-between { justify-content: space-between; }
    .items-center { align-items: center; }
    .text-center { text-align: center; }
    .rounded-2xl { border-radius: 1rem; }
    .rounded-lg { border-radius: 0.5rem; }
    .p-4 { padding: 1rem; }
    .sm\:p-6 { padding: 1.5rem; }
    .p-8 { padding: 2rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .py-10 { padding-top: 2.5rem; padding-bottom: 2.5rem; }
    .border { border-width: 1px; }
    .border-white\/20 { border-color: rgba(255,255,255,.2); }
    .border-white\/30 { border-color: rgba(255,255,255,.3); }
    .border-t { border-top-width: 1px; }
    .bg-white\/10 { background: rgba(255,255,255,.1); }
    .bg-white\/20 { background: rgba(255,255,255,.2); }
    .bg-black\/30 { background: rgba(0,0,0,.3); }
    .backdrop-blur-sm { backdrop-filter: blur(6px); }
    .animate-spin { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .h-12 { height: 3rem; }
    .w-12 { width: 3rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .leading-relaxed { line-height: 1.625; }
    .overflow-auto { overflow: auto; }
    .max-h-60 { max-height: 15rem; }
    .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .duration-200 { transition-duration: 200ms; }
    
    /* Custom hover effects */
    .hover\:bg-white\/20:hover { background: rgba(255,255,255,.2); }
    
    /* Program details specific styles */
    .program-details {
      color: white;
    }
    
    .program-section {
      border-bottom: 1px solid rgba(255,255,255,.1);
    }
    
    .program-section:last-child {
      border-bottom: none;
    }
    
  `]
})
export class ProgramDetailsViewComponent implements OnInit {
  id: string | null = null;
  program: any = null;
  loading = false;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.fetch(this.id);
    }
  }

  fetch(id: string) {
    this.loading = true;
    this.error = null;
    this.api.getProgramsDetailById(id).subscribe({
      next: res => {
        this.program = res?.program || res || null;
        this.loading = false;
      },
      error: err => {
        this.error = err?.message || 'خطأ غير متوقع';
        this.loading = false;
      }
    });
  }
}
