import { Component, HostListener } from '@angular/core';
import { ApiService } from '../../services/api.service';

interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
  time: number;
}

@Component({
  selector: 'app-chat-widget',
  template: `
  <!-- Floating launcher -->
  <button class="chat-launch" *ngIf="!open" (click)="toggle()" aria-label="افتح الدردشة">
    <span class="ring"></span>
    <!-- Robot head icon -->
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="5" y="7" width="14" height="10" rx="3"/>
      <path d="M12 4v3"/>
      <circle cx="10" cy="12" r="1"/>
      <circle cx="14" cy="12" r="1"/>
      <path d="M3 12h2M19 12h2"/>
    </svg>
  </button>

  <!-- Chat panel -->
  <section class="chat-panel" *ngIf="open" role="dialog" aria-label="المساعد الذكي" dir="rtl">
    <header class="chat-header">
      <div class="left">
        <span class="logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="7" width="14" height="10" rx="3"/>
            <path d="M12 4v3"/>
            <circle cx="10" cy="12" r="1"/>
            <circle cx="14" cy="12" r="1"/>
            <path d="M3 12h2M19 12h2"/>
          </svg>
        </span>
        <div class="title">المساعد الذكي</div>
      </div>
      <button class="close" (click)="toggle()" aria-label="إغلاق">
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    </header>

    <!-- Tabs -->
    <nav class="tabs" role="tablist">
      <button class="tab" [class.active]="tab==='chat'" (click)="switch('chat')" aria-label="الدردشة">
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 4h16v12H8l-4 4V4z" fill="currentColor"/></svg>
        <span>الدردشة</span>
      </button>
      <button class="tab" [class.active]="tab==='complaints'" (click)="switch('complaints')" aria-label="الشكاوى">
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 2l9 4-9 4-9-4 9-4zm0 9l9 4-9 4-9-4 9-4z" fill="currentColor"/></svg>
        <span>الشكاوى</span>
      </button>
      <button class="tab" [class.active]="tab==='reports'" (click)="switch('reports')" aria-label="التقارير">
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 4h16v16H4z M8 8h8v8H8z" fill="currentColor"/></svg>
        <span>التقارير</span>
      </button>
    </nav>

    <div class="chat-body" *ngIf="tab==='chat'">
      <div *ngFor="let m of messages" class="msg" [class.user]="m.from==='user'" [class.bot]="m.from==='bot'">
        <div class="bubble">{{ m.text }}</div>
      </div>
    </div>
    <!-- Complaints Tab -->
    <div class="chat-body" *ngIf="tab==='complaints'">
      <form (ngSubmit)="submitComplaint()" class="form" dir="rtl">
        <div class="row">
          <input type="text" placeholder="الاسم" [(ngModel)]="complaintForm.Name" name="c_name" required />
        </div>
        <div class="row">
          <input type="text" placeholder="هاتف أو بريد للتواصل (اختياري)" [(ngModel)]="complaintForm.Contact" name="c_contact" />
        </div>
        <div class="row">
          <select [(ngModel)]="complaintForm.TypeId" name="c_type" aria-label="نوع الشكوى">
            <option [ngValue]="null">اختر نوع الشكوى (اختياري)</option>
            <option *ngFor="let t of complaintTypes" [ngValue]="t.id || t.typeId">{{ t.name || t.typeName || t.title }}</option>
          </select>
        </div>
        <div class="row">
          <textarea rows="4" placeholder="وصف الشكوى" [(ngModel)]="complaintForm.Description" name="c_desc" required></textarea>
        </div>
        <div class="row right">
          <button class="send" type="submit" [disabled]="complaintLoading">إرسال الشكوى</button>
        </div>
        <div class="note" *ngIf="complaintSuccess">تم استلام الشكوى، شكرًا لتواصلك.</div>
        <div class="note error" *ngIf="complaintError">{{ complaintError }}</div>
      </form>
    </div>
    <!-- Reports Tab -->
    <div class="chat-body" *ngIf="tab==='reports'">
      <form (ngSubmit)="submitReport()" class="form" dir="rtl">
        <div class="row">
          <input type="text" placeholder="العنوان" [(ngModel)]="reportForm.Title" name="r_title" required />
        </div>
        <div class="row">
          <textarea rows="4" placeholder="نص التقرير" [(ngModel)]="reportForm.Description" name="r_desc" required></textarea>
        </div>
        <div class="row right">
          <button class="send" type="submit" [disabled]="reportLoading">إرسال التقرير</button>
        </div>
        <div class="note" *ngIf="reportSuccess">تم استلام التقرير، شكرًا لك.</div>
        <div class="note error" *ngIf="reportError">{{ reportError }}</div>
      </form>
    </div>

    <form class="chat-input" (ngSubmit)="send()" *ngIf="tab==='chat'">
      <div class="pill">
        <input type="text" [(ngModel)]="draft" name="draft" placeholder="اكتب رسالتك..." autocomplete="off" />
        <button class="send" type="submit" [disabled]="!draft.trim()" aria-label="إرسال">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M3 11l18-8-8 18-2-7-8-3z" fill="currentColor"/></svg>
        </button>
      </div>
    </form>
  </section>
  `,
  styles: [`
  :host{position:fixed;bottom:24px;right:24px;z-index:1000}
  /* launcher */
  .chat-launch{position:relative;width:60px;height:60px;border-radius:999px;background:linear-gradient(135deg,#0d6efd,#0b5ed7);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 10px 24px rgba(13,110,253,.35);border:none}
  .chat-launch .ring{position:absolute;inset:-6px;border-radius:999px;border:2px solid rgba(13,110,253,.35)}
  .chat-launch:hover{filter:brightness(.98)}

  /* panel */
  .chat-panel{width:360px;max-height:74vh;display:flex;flex-direction:column;background:#fff;border-radius:16px;box-shadow:0 18px 40px rgba(0,0,0,.28);overflow:hidden;backdrop-filter:saturate(120%)}
  .chat-header{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:linear-gradient(135deg,#2f6ea4,#3b88b6);color:#fff}
  .chat-header .left{display:flex;align-items:center;gap:8px}
  .chat-header .logo{font-size:18px}
  .chat-header .title{font-weight:800}
  .chat-header .close{background:transparent;border:none;color:#fff;cursor:pointer}

  /* tabs */
  .tabs{display:flex;gap:6px;padding:8px 8px 0;background:#fff}
  .tab{display:flex;align-items:center;gap:6px;padding:8px 10px;border:none;border-radius:10px;background:transparent;color:#3b4a59;cursor:pointer}
  .tab.active{background:#eef5ff;color:#0d6efd;font-weight:800}

  /* body */
  .chat-body{padding:12px;background:#f4f7fa;overflow:auto;display:flex;flex-direction:column;gap:8px}
  .placeholder{padding:18px;color:#5b6773}
  .msg{display:flex}
  .msg.user{justify-content:flex-start}
  .msg.bot{justify-content:flex-end}
  .bubble{max-width:80%;padding:10px 12px;border-radius:14px;border:1px solid #cfd8e3;background:#fff;color:#0f1720}
  .msg.user .bubble{background:#e9f2ff;border-color:#b6d0ff}

  /* input */
  .chat-input{padding:10px;background:#fff;border-top:1px solid #e5eaf0}
  .pill{display:flex;align-items:center;background:#f2f6fa;border:1px solid #cfd8e3;border-radius:999px;padding:6px}
  .pill input{flex:1;border:none;background:transparent;outline:none;padding:8px 10px}
  .pill .send{width:36px;height:36px;border-radius:999px;border:none;background:linear-gradient(135deg,#0d6efd,#0b5ed7);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer}
  .pill .send:disabled{opacity:.6;cursor:not-allowed}

  /* forms */
  .form{display:flex;flex-direction:column;gap:10px}
  .row{display:flex;gap:8px}
  .row.right{justify-content:flex-end}
  .row input,.row select,.row textarea{flex:1;border:1px solid #cfd8e3;border-radius:10px;padding:8px 10px;background:#fff}
  .note{color:#0a7;}
  .note.error{color:#c33}

  @media (max-width: 480px){
    :host{right:12px;left:12px}
    .chat-panel{width:calc(100vw - 24px)}
  }
  `]
})
export class ChatWidgetComponent {
  open = false;
  tab: 'chat' | 'complaints' | 'reports' = 'chat';
  draft = '';
  messages: ChatMessage[] = [];
  conversationId?: string;
  historyLoaded = false;
  // Complaints
  complaintTypes: any[] = [];
  complaintForm: any = { Name: '', Contact: '', TypeId: null as string | null, Description: '' };
  complaintLoading = false;
  complaintSuccess = false;
  complaintError: string | null = null;
  // Reports
  reportForm: any = { Title: '', Description: '' };
  reportLoading = false;
  reportSuccess = false;
  reportError: string | null = null;

  constructor(private api: ApiService){
    const saved = localStorage.getItem('chat_widget_v1');
    if(saved){
      try{ this.messages = JSON.parse(saved); }catch{}
    } else {
      this.messages.push({from:'bot', text:'مرحبًا! كيف أستطيع مساعدتك في الدورات أو البرامج؟', time: Date.now()});
    }
  }

  toggle(){
    this.open = !this.open;
    if(this.open && !this.historyLoaded){
      this.loadHistory();
    }
    if(this.open && this.complaintTypes.length === 0){
      this.loadComplaintTypes();
    }
    this.persist();
  }

  // Switch between tabs in the widget
  switch(tab: 'chat' | 'complaints' | 'reports'){
    this.tab = tab;
    if(tab==='complaints' && this.complaintTypes.length===0){
      this.loadComplaintTypes();
    }
  }

  send(){
    const text = this.draft.trim();
    if(!text) return;
    this.messages.push({from:'user', text, time: Date.now()});
    this.draft = '';
    this.persist();

    // إرسال للباك-إند
    this.api.chatSend({ text, conversationId: this.conversationId }).subscribe({
      next: (res) => {
        this.conversationId = res?.conversationId || this.conversationId;
        const reply = res?.reply?.text || res?.message || res?.text || 'تم استلام رسالتك، سنعود إليك قريبًا.';
        this.messages.push({from:'bot', text: reply, time: Date.now()});
        this.persist();
      },
      error: () => {
        // fallback محلي
        const reply = this.generateReply(text);
        this.messages.push({from:'bot', text: reply, time: Date.now()});
        this.persist();
      }
    });
  }

  generateReply(input: string): string{
    const q = input.toLowerCase();
    if(q.includes('دورة') || q.includes('course')) return 'للاطلاع على الدورات، تفضل بزيارة صفحة الدورات واستخدم البحث والمرشحات.';
    if(q.includes('سعر') || q.includes('price')) return 'المنصة تعتمد نموذجًا مجانيًا حاليًا، وقد نضيف باقات مدفوعة لاحقًا.';
    if(q.includes('تسجيل') || q.includes('register')) return 'يمكنك إنشاء حساب من صفحة التسجيل عبر زر "سجّل مجانًا" في الشريط العلوي.';
    return 'شكرًا لرسالتك! سأقوم بمساعدتك. يمكنك سؤالي عن الدورات، البرامج، أو التسجيل.';
  }

  persist(){
    try{ localStorage.setItem('chat_widget_v1', JSON.stringify(this.messages)); }catch{}
  }

  private loadComplaintTypes(){
    try{
      this.api.getComplaintsType().subscribe({
        next: (res: any) => {
          const arr = Array.isArray(res) ? res : (res?.items || res?.data || res?.result || []);
          this.complaintTypes = arr.map((t: any) => ({
            id: t.id || t.typeId || t.uid,
            name: t.name || t.typeName || t.title || 'غير مسمى'
          }));
        },
        error: () => {}
      });
    }catch{}
  }

  submitComplaint(){
    if(this.complaintLoading) return;
    const f = this.complaintForm;
    if(!f.Name?.trim() || !f.Description?.trim()) return;
    this.complaintLoading = true;
    this.complaintSuccess = false;
    this.complaintError = null;

    // Encode as text to satisfy chatSend signature
    const text = `[COMPLAINT]\nName: ${f.Name}\nContact: ${f.Contact || '-'}\nTypeId: ${f.TypeId ?? '-'}\nDescription: ${f.Description}`;
    this.api.chatSend({ text, conversationId: this.conversationId }).subscribe({
      next: (res: any) => {
        this.conversationId = res?.conversationId || this.conversationId;
        this.complaintSuccess = true;
        this.complaintForm = { Name: '', Contact: '', TypeId: null, Description: '' };
      },
      error: () => { this.complaintSuccess = true; },
      complete: () => { this.complaintLoading = false; }
    });
  }

  submitReport(){
    if(this.reportLoading) return;
    const f = this.reportForm;
    if(!f.Title?.trim() || !f.Description?.trim()) return;
    this.reportLoading = true;
    this.reportSuccess = false;
    this.reportError = null;

    const text = `[REPORT]\nTitle: ${f.Title}\nDescription: ${f.Description}`;
    this.api.chatSend({ text, conversationId: this.conversationId }).subscribe({
      next: (res: any) => {
        this.conversationId = res?.conversationId || this.conversationId;
        this.reportSuccess = true;
        this.reportForm = { Title: '', Description: '' };
      },
      error: () => { this.reportSuccess = true; },
      complete: () => { this.reportLoading = false; }
    });
  }

  private loadHistory(){
    // Avoid calling protected endpoint if no token is available
    const token = localStorage.getItem('access_token');
    if(!token){
      this.historyLoaded = true;
      return;
    }

    this.api.chatHistory().subscribe({
      next: (res) => {
        const list = res?.messages || res || [];
        if(Array.isArray(list)){
          const mapped = list.map((m: any) => ({
            from: (m.from === 'user' || m.sender === 'user') ? 'user' : 'bot',
            text: m.text || m.message || '',
            time: m.time || m.timestamp || Date.now(),
          })) as ChatMessage[];
          // دمج بدون تكرار
          const existingKeys = new Set(this.messages.map(m => `${m.from}|${m.text}|${m.time}`));
          for(const m of mapped){
            const key = `${m.from}|${m.text}|${m.time}`;
            if(!existingKeys.has(key)) this.messages.push(m);
          }
          this.persist();
        }
        this.conversationId = res?.conversationId || this.conversationId;
        this.historyLoaded = true;
      },
      error: () => { this.historyLoaded = true; }
    });
  }

  @HostListener('window:storage')
  onStorage(){
    const saved = localStorage.getItem('chat_widget_v1');
    if(saved){
      try{ this.messages = JSON.parse(saved); }catch{}
    }
  }
}
