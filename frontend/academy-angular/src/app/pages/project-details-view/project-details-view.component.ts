import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-project-details-view',
  template: `
    <section class="container">
      <h1>تفاصيل المشروع</h1>
      <div>المعرف: {{ id || '—' }}</div>

      <div *ngIf="loading">جاري التحميل...</div>
      <div *ngIf="error" class="error">حدث خطأ: {{ error }}</div>

      <ng-container *ngIf="!loading && !error">
        <div *ngIf="project; else notFound">
          <h2>{{ project?.Title || project?.Name || 'مشروع' }}</h2>
          <p>{{ project?.Description || project?.Desc }}</p>
          <pre class="json">{{ project | json }}</pre>
        </div>
        <ng-template #notFound>
          <div>لا توجد بيانات للمشروع.</div>
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
export class ProjectDetailsViewComponent implements OnInit {
  id: string | null = null;
  project: any = null;
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
    this.api.getProjectsMasterById(id).subscribe({
      next: res => {
        this.project = res?.project || res || null;
        this.loading = false;
      },
      error: err => {
        this.error = err?.message || 'خطأ غير متوقع';
        this.loading = false;
      }
    });
  }
}
