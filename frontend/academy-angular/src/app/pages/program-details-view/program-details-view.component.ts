import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-program-details-view',
  template: `
    <section class="container">
      <h1>تفاصيل البرنامج</h1>
      <div>المعرف: {{ id || '—' }}</div>

      <div *ngIf="loading">جاري التحميل...</div>
      <div *ngIf="error" class="error">حدث خطأ: {{ error }}</div>

      <ng-container *ngIf="!loading && !error">
        <div *ngIf="program; else notFound">
          <h2>{{ program?.Title || program?.Name || 'برنامج' }}</h2>
          <p>{{ program?.Description || program?.Desc }}</p>
          <pre class="json">{{ program | json }}</pre>
        </div>
        <ng-template #notFound>
          <div>لا توجد بيانات للبرنامج.</div>
        </ng-template>
      </ng-container>
    </section>
  `,
  styles: [`
    .container{padding:24px}
    .error{color:#b00020}
    .json{background:#fafafa;padding:8px;border-radius:6px;max-height:300px;overflow:auto}
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
    this.api.getProgramsContentMasterById(id).subscribe({
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
