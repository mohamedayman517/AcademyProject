import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-student-attendance',
  template: `
    <section class="container" dir="rtl">
      <div class="hero">
        <div class="hero-content">
          <h1>سجل الحضور</h1>
          <p>عرض حضور وغياب الطالب حسب التاريخ والبرنامج.</p>
        </div>
      </div>

      <div *ngIf="loading" class="status">جاري التحميل...</div>
      <div *ngIf="!loading && error" class="status error">{{ error }}</div>

      <div *ngIf="!loading && !error" class="card-surface" style="padding:12px;">
        <div class="filters">
          <input class="input" type="text" [(ngModel)]="q" placeholder="ابحث في الملاحظات أو البرنامج" (keydown.enter)="apply()" />
          <input class="input" type="date" [(ngModel)]="from" (change)="apply()" />
          <input class="input" type="date" [(ngModel)]="to" (change)="apply()" />
          <button class="btn" (click)="reset()">إعادة تعيين</button>
        </div>

        <div *ngIf="paged.length; else noData" class="list">
          <div class="card item" *ngFor="let a of paged">
            <div class="row">
              <div class="badge" [class.ok]="a.present" [class.absent]="!a.present">{{ a.present ? 'حاضر' : 'غائب' }}</div>
              <div class="title">{{ a.program || a.ProgramName || 'برنامج' }}</div>
            </div>
            <div class="meta">التاريخ: {{ a.date | date:'mediumDate' }}</div>
            <div class="desc" *ngIf="a.note">ملاحظة: {{ a.note }}</div>
          </div>
        </div>
        <ng-template #noData>
          <div class="empty">لا توجد سجلات</div>
        </ng-template>

        <div class="pagination" *ngIf="filtered.length > pageSize">
          <button class="btn" (click)="prev()" [disabled]="page<=1">السابق</button>
          <span>صفحة {{ page }} من {{ totalPages }}</span>
          <button class="btn" (click)="next()" [disabled]="page>=totalPages">التالي</button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .container{padding:24px}
    .hero{background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:16px;padding:18px;color:#fff;margin-bottom:12px}
    .status{padding:12px}
    .status.error{color:#c33}
    .card-surface{background:#fff;border:1px solid #eef0f4;border-radius:12px}
    .filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}
    .input{height:38px;border:1px solid #e5e7eb;border-radius:10px;padding:0 10px;background:#fafafa}
    .btn{height:38px;padding:0 12px;border-radius:10px;border:1px solid #e5e7eb;background:#fff;cursor:pointer}
    .list{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}
    .card{border:1px solid #eef0f4;border-radius:12px;padding:12px;background:#fff}
    .row{display:flex;align-items:center;gap:8px;margin-bottom:6px}
    .badge{border-radius:999px;padding:4px 10px;border:1px solid #e5e7eb;background:#fafafa}
    .badge.ok{background:#ecfeff;border-color:#a5f3fc;color:#0e7490}
    .badge.absent{background:#fff1f2;border-color:#fecdd3;color:#be123c}
    .title{font-weight:700}
    .meta{color:#6b7280}
    .desc{color:#374151}
    .pagination{display:flex;gap:8px;justify-content:center;margin-top:10px}
    .empty{padding:18px;text-align:center;color:#6b7280}
  `]
})
export class StudentAttendanceComponent implements OnInit {
  loading = false;
  error: string | null = null;

  all: any[] = [];
  filtered: any[] = [];
  page = 1;
  pageSize = 8;
  get totalPages(){ return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get paged(){ const s=(this.page-1)*this.pageSize; return this.filtered.slice(s, s+this.pageSize); }

  q = '';
  from: string | null = null;
  to: string | null = null;
  currentStudentEmail = '';

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    this.currentStudentEmail = (this.auth.getUser()?.email || this.auth.getUser()?.Email || '').toLowerCase();
    this.load();
  }

  private load(){
    this.loading = true; this.error = null;
    this.api.getStudentAttend().subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res?.items || res?.data || []);
        this.all = list.map((x: any, i: number) => ({
          id: x.id || x.Id || `${i}`,
          studentEmail: (x.studentEmail || x.StudentEmail || '').toLowerCase(),
          studentId: x.studentsDataId || x.StudentsDataId || x.studentId || x.StudentId || null,
          date: x.date || x.Date || new Date().toISOString(),
          present: !!(x.present ?? x.Present ?? x.attend ?? x.Attend ?? true),
          note: x.note || x.Note || '',
          program: x.program || x.Program || x.programName || x.ProgramName || ''
        }));
        this.apply();
        this.loading = false;
      },
      error: (e) => {
        this.all = this.mock();
        this.apply();
        this.loading = false;
      }
    });
  }

  apply(){
    const q = (this.q||'').toLowerCase().trim();
    const from = this.from ? new Date(this.from) : null;
    const to = this.to ? new Date(this.to) : null;
    let list = this.all;
    if(this.currentStudentEmail){ list = list.filter(a => !a.studentEmail || a.studentEmail === this.currentStudentEmail); }
    if(q){ list = list.filter(a => (a.note||'').toLowerCase().includes(q) || (a.program||'').toLowerCase().includes(q)); }
    if(from || to){
      list = list.filter(a => { const d = new Date(a.date); return (!from || d>=from) && (!to || d<=to); });
    }
    this.filtered = list.sort((a,b)=> new Date(b.date).getTime()-new Date(a.date).getTime());
    this.page = 1;
  }

  reset(){ this.q=''; this.from=null; this.to=null; this.apply(); }
  next(){ if(this.page<this.totalPages) this.page++; }
  prev(){ if(this.page>1) this.page--; }

  private mock(){
    return [
      { id:'1', studentEmail:this.currentStudentEmail, date:'2024-01-10', present:true, note:'', program:'Web 101' },
      { id:'2', studentEmail:this.currentStudentEmail, date:'2024-01-12', present:false, note:'غياب بعذر', program:'Web 101' },
      { id:'3', studentEmail:this.currentStudentEmail, date:'2024-01-15', present:true, note:'', program:'JS Basics' },
    ];
  }
}
