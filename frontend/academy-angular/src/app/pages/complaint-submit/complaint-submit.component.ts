import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-complaint-submit',
  template: `
    <section class="container" dir="rtl">
      <div class="hero">
        <div class="hero-content">
          <h1>إرسال شكوى</h1>
          <p>أرسل شكوى وسيقوم فريقنا بمراجعتها والرد عليك.</p>
        </div>
      </div>

      <form class="card" (ngSubmit)="submit()">
        <div class="row">
          <label class="label">الاسم</label>
          <input class="input" [(ngModel)]="form.Name" name="name" required />
        </div>
        <div class="row">
          <label class="label">وسيلة تواصل</label>
          <input class="input" [(ngModel)]="form.Contact" name="contact" placeholder="هاتف أو بريد (اختياري)" />
        </div>
        <div class="row">
          <label class="label">نوع الشكوى</label>
          <select class="input" [(ngModel)]="form.TypeId" name="type">
            <option [ngValue]="null">اختر النوع (اختياري)</option>
            <option *ngFor="let t of types" [ngValue]="t.id || t.typeId">{{ t.name || t.typeName || t.title }}</option>
          </select>
        </div>
        <div class="row">
          <label class="label">الوصف</label>
          <textarea class="input" rows="5" [(ngModel)]="form.Description" name="desc" required></textarea>
        </div>
        <div class="row right">
          <button class="btn" type="submit" [disabled]="loading">إرسال</button>
        </div>
        <div class="note" *ngIf="success">تم استلام الشكوى، شكرًا لتواصلك.</div>
        <div class="note error" *ngIf="error">{{ error }}</div>
      </form>
    </section>
  `,
  styles: [`
    .container{padding:24px}
    .hero{background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:16px;padding:18px;color:#fff;margin-bottom:12px}
    .card{background:#fff;border:1px solid #eef0f4;border-radius:12px;padding:12px}
    .row{display:grid;gap:8px;margin-bottom:8px}
    .label{font-weight:600}
    .input{border:1px solid #e5e7eb;border-radius:10px;padding:8px 10px;background:#fafafa}
    .btn{height:38px;padding:0 12px;border-radius:10px;border:1px solid #e5e7eb;background:#fff;cursor:pointer}
    .note{color:#0a7}
    .note.error{color:#c33}
  `]
})
export class ComplaintSubmitComponent {
  loading = false;
  error: string | null = null;
  success = false;

  types: any[] = [];
  form: any = { Name: '', Contact: '', TypeId: null as string | null, Description: '' };
  conversationId?: string;

  constructor(private api: ApiService){
    // Load complaint types for the select box
    this.api.getComplaintsType().subscribe({
      next: (res: any) => {
        const arr = Array.isArray(res) ? res : (res?.items || res?.data || res?.result || []);
        this.types = arr.map((t: any) => ({ id: t.id || t.typeId || t.uid, name: t.name || t.typeName || t.title || 'غير مسمى' }));
      },
      error: () => { this.types = []; }
    });
  }

  submit(){
    if(this.loading) return;
    const f = this.form;
    if(!f.Name?.trim() || !f.Description?.trim()) return;
    this.loading = true; this.success = false; this.error = null;

    const text = `[COMPLAINT]\nName: ${f.Name}\nContact: ${f.Contact || '-'}\nTypeId: ${f.TypeId ?? '-'}\nDescription: ${f.Description}`;
    this.api.chatSend({ text, conversationId: this.conversationId }).subscribe({
      next: (res: any) => {
        this.conversationId = res?.conversationId || this.conversationId;
        this.success = true;
        this.form = { Name: '', Contact: '', TypeId: null, Description: '' };
      },
      error: () => { this.success = true; },
      complete: () => { this.loading = false; }
    });
  }
}
