import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-complaints',
  template: `
    <section class="container">
      <div class="hero">
        <div class="hero-content">
          <h1>{{ 'complaints_title' | t }}</h1>
          <p>{{ 'complaints_desc' | t }}</p>
        </div>
      </div>

      <!-- Filters Toolbar -->
      <div class="toolbar card-surface">
        <div class="field">
          <label>{{ 'text_search' | t }}</label>
          <input class="input" type="text" [(ngModel)]="q" (keydown.enter)="applyFilters()" [placeholder]="'search_in_title_desc' | t"/>
        </div>
        <div class="field">
          <label>{{ 'status_lbl' | t }}</label>
          <select class="input" [(ngModel)]="selectedStatus" (change)="applyFilters()">
            <option [ngValue]="null">{{ 'all_statuses' | t }}</option>
            <option *ngFor="let s of statuses" [ngValue]="s?.Id || s?.id">{{ s?.Name || s?.StatusName || s?.Title }}</option>
          </select>
        </div>
        <div class="field">
          <label>{{ 'type_lbl' | t }}</label>
          <select class="input" [(ngModel)]="selectedType" (change)="applyFilters()">
            <option [ngValue]="null">{{ 'all_types' | t }}</option>
            <option *ngFor="let t of complaintTypes" [ngValue]="t?.Id || t?.id">{{ t?.typeNameL1 || t?.TypeName || t?.Name }}</option>
          </select>
        </div>
        <div class="field">
          <label>{{ 'from_date' | t }}</label>
          <input class="input" type="date" [(ngModel)]="fromDate" (change)="applyFilters()"/>
        </div>
        <div class="field">
          <label>{{ 'to_date' | t }}</label>
          <input class="input" type="date" [(ngModel)]="toDate" (change)="applyFilters()"/>
        </div>
        <div class="actions">
          <button class="btn primary" (click)="applyFilters()">{{ 'apply_filters' | t }}</button>
          <button class="btn" (click)="resetFilters()">{{ 'reset_filters' | t }}</button>
        </div>
      </div>

      <div *ngIf="loading" class="skeleton-grid">
        <div class="skeleton-card" *ngFor="let i of [1,2,3,4,5,6]"></div>
      </div>
      <div *ngIf="error" class="error">{{ 'error_prefix' | t }} {{ error }}</div>

      <div *ngIf="!loading && !error">
        <div *ngIf="pagedComplaints?.length; else noData" class="list">
          <div class="card item-card" *ngFor="let c of pagedComplaints">
            <div class="item-head">
              <div class="id-badge">#{{ c?.complaintsNo || c?.id }}</div>
              <div class="badges">
                <span class="badge status">{{ getDisplayName(c?.complaintsStatusesId, complaintStatuses, 'statusNameL1') }}</span>
                <span class="badge type">{{ getDisplayName(c?.complaintsTypeId, complaintTypes, 'typeNameL1') }}</span>
              </div>
            </div>
            <div class="title">{{ c?.Title || c?.Subject || 'بدون عنوان' }}</div>
            <div class="meta">
              <div>{{ 'student_lbl' | t }} <strong>{{ getDisplayName(c?.studentsDataId, students, 'studentNameL1') }}</strong></div>
              <div>{{ 'date_lbl' | t }} {{ c?.date ? (c.date | date:'mediumDate') : '-' }}</div>
            </div>
            <div class="desc">{{ c?.description || c?.Description || '-' }}</div>
          </div>
        </div>
        <ng-template #noData>
          <div class="empty-state card-surface">
            <div class="emoji">🙌</div>
            <div class="empty-title">{{ 'no_complaints_title' | t }}</div>
            <div class="empty-sub">{{ 'no_complaints_sub' | t }}</div>
          </div>
        </ng-template>

        <!-- Pagination -->
        <div class="pagination" *ngIf="total > pageSize">
          <button class="btn" (click)="prevPage()" [disabled]="page<=1">{{ 'prev' | t }}</button>
          <span class="page-info">{{ ('page_of' | t).replace('{{page}}', page) .replace('{{total}}', totalPages) }}</span>
          <button class="btn" (click)="nextPage()" [disabled]="page>=totalPages">{{ 'next' | t }}</button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .container{padding:24px}
    .hero{background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:16px;padding:24px;color:#fff;margin-bottom:16px}
    .hero-content h1{margin:0 0 6px 0;font-weight:700}
    .hero-content p{margin:0;opacity:.9}

    .card-surface{background:#fff;border:1px solid #eef0f4;border-radius:12px}

    .toolbar{display:grid;grid-template-columns:repeat(12,1fr);gap:12px;align-items:end;margin:12px 0;padding:12px}
    .field{display:flex;flex-direction:column;gap:6px}
    .field:nth-child(1){grid-column:span 5}
    .field:nth-child(2){grid-column:span 3}
    .field:nth-child(3){grid-column:span 3}
    .field:nth-child(4),.field:nth-child(5){grid-column:span 2}
    .actions{display:flex;gap:8px;grid-column:1/-1;justify-content:flex-end}
    .input{height:40px;border:1px solid #e5e7eb;border-radius:10px;padding:0 12px;background:#fafafa}

    .btn{height:40px;padding:0 14px;border-radius:10px;border:1px solid #e5e7eb;background:#fff;cursor:pointer}
    .btn.primary{background:#4f46e5;border-color:#4f46e5;color:#fff}
    .btn:disabled{opacity:.6;cursor:not-allowed}

    .list{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
    .card{border:1px solid #eef0f4;border-radius:12px;padding:14px;background:#fff}
    .item-card{transition:transform .15s ease, box-shadow .15s ease}
    .item-card:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(17,24,39,.08)}
    .item-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
    .id-badge{background:#f1f5f9;border:1px solid #e2e8f0;border-radius:999px;padding:4px 10px;font-size:12px;color:#334155}
    .badges{display:flex;gap:6px}
    .badge{border-radius:999px;padding:4px 10px;font-size:12px;border:1px solid #e5e7eb;background:#fafafa}
    .badge.status{background:#ecfeff;border-color:#a5f3fc;color:#0e7490}
    .badge.type{background:#f5f3ff;border-color:#ddd6fe;color:#5b21b6}
    .title{font-weight:700;margin-bottom:4px;color:#111827}
    .meta{color:#6b7280;margin-bottom:8px;display:flex;gap:12px;flex-wrap:wrap}
    .desc{color:#374151;line-height:1.6}

    .empty-state{text-align:center;padding:24px}
    .empty-state .emoji{font-size:32px;margin-bottom:6px}
    .empty-title{font-weight:700;margin-bottom:4px}
    .empty-sub{color:#6b7280}

    .pagination{display:flex;gap:8px;justify-content:center;align-items:center;margin-top:16px}
    .page-info{color:#6b7280}

    .skeleton-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
    .skeleton-card{height:140px;border-radius:12px;background:linear-gradient(90deg,#eee,#f5f5f5,#eee);background-size:200% 100%;animation:shimmer 1.2s infinite}
    @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  `]
})
export class ComplaintsComponent implements OnInit {
  complaints: any[] = [];
  filtered: any[] = [];
  loading = false;
  error: string | null = null;
  // filters
  q = '';
  statuses: any[] = [];
  selectedStatus: string | null = null;
  fromDate: string | null = null;
  toDate: string | null = null;
  // lookups
  complaintTypes: any[] = [];
  complaintStatuses: any[] = [];
  students: any[] = [];
  academies: any[] = [];
  branches: any[] = [];
  // pagination
  page = 1;
  pageSize = 10;
  get total() { return this.filtered.length; }
  get totalPages() { return Math.max(1, Math.ceil(this.total / this.pageSize)); }
  get pagedComplaints() {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }
  // extra filter (type) for parity with React page
  selectedType: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  private loadAllData(): void {
    this.loading = true;
    this.error = null;
    forkJoin({
      complaints: this.api.getComplaintsStudent().pipe(catchError(_ => of([]))),
      types: this.api.getComplaintsType().pipe(catchError(_ => of([]))),
      statuses: this.api.getComplaintsStatus().pipe(catchError(_ => of([]))),
      students: this.api.getStudentData().pipe(catchError(_ => of([]))),
      academies: this.api.getAcademyData().pipe(catchError(_ => of([]))),
      branches: this.api.getBranchesData().pipe(catchError(_ => of([])))
    }).subscribe({
      next: ({ complaints, types, statuses, students, academies, branches }) => {
        this.complaints = this.ensureArray(complaints) || this.getMockComplaints();
        this.complaintTypes = this.ensureArray(types) || this.getMockComplaintTypes();
        this.complaintStatuses = this.ensureArray(statuses) || this.getMockComplaintStatuses();
        this.students = this.ensureArray(students) || this.getMockStudents();
        this.academies = Array.isArray(academies) ? academies : (academies?.items || academies?.data || []);
        this.branches = Array.isArray(branches) ? branches : (branches?.items || branches?.data || []);
        this.applyClientFilter();
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'خطأ غير متوقع';
        this.loading = false;
      }
    });
  }

  fetchComplaints(): void {
    this.loading = true;
    this.error = null;
    this.api.getComplaintsStudent().subscribe({
      next: (res) => {
        // Backend returns array directly or wrapped; support both
        this.complaints = Array.isArray(res) ? res : (res?.complaints || []);
        this.applyClientFilter();
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'خطأ غير متوقع';
        this.loading = false;
      }
    });
  }

  fetchStatuses(): void {
    try {
      this.api.getComplaintsStatus().subscribe({
        next: res => {
          this.statuses = Array.isArray(res) ? res : (res?.status || res?.items || []);
        },
        error: _ => {}
      });
    } catch {}
  }

  applyClientFilter() {
    const q = (this.q || '').toLowerCase().trim();
    let list = [...this.complaints];
    if (q) {
      list = list.filter(c =>
        (c?.Title || c?.Subject || c?.description || '').toString().toLowerCase().includes(q) ||
        (c?.Description || c?.description || '').toString().toLowerCase().includes(q)
      );
    }
    if (this.selectedStatus) {
      list = list.filter(c => String(c?.complaintsStatusesId || c?.ComplaintsStatusesId) === String(this.selectedStatus));
    }
    if (this.selectedType) {
      list = list.filter(c => String(c?.complaintsTypeId || c?.ComplaintsTypeId) === String(this.selectedType));
    }
    if (this.fromDate || this.toDate) {
      const from = this.fromDate ? new Date(this.fromDate) : null;
      const to = this.toDate ? new Date(this.toDate) : null;
      list = list.filter(c => {
        const d = c?.date || c?.Date;
        if (!d) return false;
        const cd = new Date(d);
        const afterFrom = from ? cd >= from : true;
        const beforeTo = to ? cd <= to : true;
        return afterFrom && beforeTo;
      });
    }
    this.filtered = list;
    this.page = 1;
  }

  applyFilters() { this.applyClientFilter(); }

  resetFilters() {
    this.q = '';
    this.selectedStatus = null;
    this.selectedType = null;
    this.fromDate = null;
    this.toDate = null;
    this.applyFilters();
  }

  getDisplayName(id: any, dataArray: any[], nameField: string): string {
    if (!id || !Array.isArray(dataArray)) return '-';
    const item = dataArray.find(x => (x?.id || x?.Id) === id);
    if (!item) return '-';
    const l1 = item[nameField] || item.statusNameL1 || item.statusesNameL1 || item.name || item.Name;
    const l2 = item.statusNameL2 || item.statusesNameL2 || item.name || item.Name;
    return l1 || l2 || (item?.id || item?.Id);
  }

  nextPage() { if (this.page < this.totalPages) this.page += 1; }
  prevPage() { if (this.page > 1) this.page -= 1; }

  // Helpers to match React page behavior
  private ensureArray<T = any>(res: any): T[] {
    if (Array.isArray(res)) return res as T[];
    if (res && Array.isArray(res.items)) return res.items as T[];
    if (res && Array.isArray(res.data)) return res.data as T[];
    return [] as T[];
  }

  private getMockComplaintTypes() { return [
    { id: '1', typeNameL1: 'شكوى أكاديمية', typeNameL2: 'Academic Complaint' },
    { id: '2', typeNameL1: 'شكوى إدارية', typeNameL2: 'Administrative Complaint' },
    { id: '3', typeNameL1: 'شكوى تقنية', typeNameL2: 'Technical Complaint' },
    { id: '4', typeNameL1: 'شكوى مالية', typeNameL2: 'Financial Complaint' }
  ]; }

  private getMockComplaintStatuses() { return [
    { id: '1', statusNameL1: 'جديد', statusNameL2: 'New' },
    { id: '2', statusNameL1: 'قيد المعالجة', statusNameL2: 'In Progress' },
    { id: '3', statusNameL1: 'محلول', statusNameL2: 'Resolved' },
    { id: '4', statusNameL1: 'مرفوض', statusNameL2: 'Rejected' },
    { id: '5', statusNameL1: 'معلق', statusNameL2: 'Pending' }
  ]; }

  private getMockStudents() { return [
    { id: '1', studentNameL1: 'أحمد محمد', studentNameL2: 'Ahmed Mohamed' },
    { id: '2', studentNameL1: 'فاطمة علي', studentNameL2: 'Fatima Ali' },
    { id: '3', studentNameL1: 'محمد حسن', studentNameL2: 'Mohamed Hassan' },
    { id: '4', studentNameL1: 'سارة أحمد', studentNameL2: 'Sara Ahmed' }
  ]; }

  private getMockComplaints() { return [
    { id: '1', complaintsNo: '001', description: 'مشكلة في تسجيل الدخول للمنصة التعليمية - لا يمكن الوصول للمحتوى الدراسي', date: '2024-01-15', complaintsTypeId: '3', complaintsStatusesId: '2', studentsDataId: '1' },
    { id: '2', complaintsNo: '002', description: 'طلب تعديل في الجدول الدراسي للفصل الثاني', date: '2024-01-16', complaintsTypeId: '1', complaintsStatusesId: '1', studentsDataId: '2' },
    { id: '3', complaintsNo: '003', description: 'مشكلة في دفع الرسوم الدراسية عبر البطاقة الائتمانية', date: '2024-01-17', complaintsTypeId: '4', complaintsStatusesId: '3', studentsDataId: '3' },
    { id: '4', complaintsNo: '004', description: 'طلب إعادة اختبار في مادة الرياضيات', date: '2024-01-18', complaintsTypeId: '1', complaintsStatusesId: '5', studentsDataId: '4' }
  ]; }
}
