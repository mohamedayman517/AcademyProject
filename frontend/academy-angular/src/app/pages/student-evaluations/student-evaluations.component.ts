import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-student-evaluations',
  template: `
    <section class="container" dir="rtl">
      <div class="hero">
        <div class="hero-content">
          <h1>تقييماتي</h1>
          <p>عرض نتائج وتقييمات الطالب حسب المواد/الدورات.</p>
        </div>
      </div>

      <div *ngIf="loading" class="status">جاري التحميل...</div>
      <div *ngIf="!loading && error" class="status error">{{ error }}</div>

      <div *ngIf="!loading && !error" class="card-surface" style="padding:12px;">
        <div class="filters">
          <input class="input" type="text" [(ngModel)]="q" placeholder="ابحث في المادة أو الملاحظات" (keydown.enter)="apply()" />
          <select class="input" [(ngModel)]="type" (change)="apply()">
            <option [ngValue]="''">كل الأنواع</option>
            <option value="quiz">اختبار</option>
            <option value="project">مشروع</option>
            <option value="task">مهمة</option>
            <option value="attendance">انضباط</option>
          </select>
          <button class="btn" (click)="reset()">إعادة تعيين</button>
        </div>

        <div *ngIf="paged.length; else noData" class="list">
          <div class="card item" *ngFor="let e of paged">
            <div class="title">{{ e.course || e.CourseName || 'مادة' }}</div>
            <div class="meta">النوع: {{ translateType(e.type) }} • الدرجة: <strong>{{ e.score }}</strong> / {{ e.total || 100 }}</div>
            <div class="desc" *ngIf="e.note">ملاحظة: {{ e.note }}</div>
          </div>
        </div>
        <ng-template #noData>
          <div class="empty">لا توجد تقييمات</div>
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
    .title{font-weight:700;margin-bottom:6px}
    .meta{color:#6b7280}
    .desc{color:#374151}
    .pagination{display:flex;gap:8px;justify-content:center;margin-top:10px}
    .empty{padding:18px;text-align:center;color:#6b7280}
  `]
})
export class StudentEvaluationsComponent implements OnInit {
  loading = false;
  error: string | null = null;

  all: any[] = [];
  filtered: any[] = [];
  page = 1;
  pageSize = 8;
  get totalPages(){ return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get paged(){ const s=(this.page-1)*this.pageSize; return this.filtered.slice(s, s+this.pageSize); }

  q = '';
  type = '';
  currentStudentEmail = '';

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    this.currentStudentEmail = (this.auth.getUser()?.email || this.auth.getUser()?.Email || '').toLowerCase();
    this.load();
  }

  private load(){
    this.loading = true; this.error = null;
    this.api.getStudentEvaluation().subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res?.items || res?.data || []);
        this.all = list.map((x: any, i: number) => ({
          id: x.id || x.Id || `${i}`,
          studentEmail: (x.studentEmail || x.StudentEmail || '').toLowerCase(),
          course: x.course || x.Course || x.courseName || x.CourseName || '',
          type: (x.type || x.Type || '').toString().toLowerCase(),
          score: Number(x.score ?? x.Score ?? 0),
          total: Number(x.total ?? x.Total ?? 100),
          note: x.note || x.Note || ''
        }));
        this.apply();
        this.loading = false;
      },
      error: () => {
        this.all = this.mock();
        this.apply();
        this.loading = false;
      }
    });
  }

  apply(){
    const q = (this.q||'').toLowerCase().trim();
    let list = this.all;
    if(this.currentStudentEmail){ list = list.filter(e => !e.studentEmail || e.studentEmail === this.currentStudentEmail); }
    if(q){ list = list.filter(e => (e.course||'').toLowerCase().includes(q) || (e.note||'').toLowerCase().includes(q)); }
    if(this.type){ list = list.filter(e => e.type === this.type); }
    this.filtered = list.sort((a,b)=> (b.score - a.score));
    this.page = 1;
  }

  reset(){ this.q=''; this.type=''; this.apply(); }
  next(){ if(this.page<this.totalPages) this.page++; }
  prev(){ if(this.page>1) this.page--; }

  translateType(t: string){
    switch((t||'').toLowerCase()){
      case 'quiz': return 'اختبار';
      case 'project': return 'مشروع';
      case 'task': return 'مهمة';
      case 'attendance': return 'انضباط';
      default: return 'غير محدد';
    }
  }

  private mock(){
    return [
      { id:'1', studentEmail:this.currentStudentEmail, course:'Web 101', type:'quiz', score:85, total:100, note:'' },
      { id:'2', studentEmail:this.currentStudentEmail, course:'JS Basics', type:'project', score:92, total:100, note:'عمل ممتاز' },
      { id:'3', studentEmail:this.currentStudentEmail, course:'JS Basics', type:'task', score:75, total:100, note:'' },
    ];
  }
}
