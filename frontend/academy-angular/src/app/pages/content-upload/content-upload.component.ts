import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-content-upload',
  template: `
    <section class="container">
      <div class="header">
        <h1>{{ 'upload_title' | t }}</h1>
        <p>{{ 'upload_sub' | t }}</p>
      </div>

      <div class="upload-card">
        <form (ngSubmit)="submit()" #f="ngForm" class="form" novalidate>
          <div class="grid">
            <!-- Program Master Selection -->
            <div class="field field-col">
              <span class="label">{{ 'main_program_req' | t }}</span>
              <select class="input" name="ProgramsContentMasterId" [(ngModel)]="model.ProgramsContentMasterId" required>
                <option value="">{{ loading ? ('loading_plain' | t) : ('choose_program' | t) }}</option>
                <option *ngFor="let master of masters" [value]="master.Id || master.id">
                  {{ master.SessionNameL1 || master.sessionNameL1 || master.SessionNameL2 || master.sessionNameL2 || master.Description || (master.Id || master.id) }}
                </option>
              </select>
            </div>

            <!-- Video URL -->
            <div class="field field-col">
              <span class="label">{{ 'video_url_opt' | t }}</span>
              <input class="input" type="url" name="SessionVideo" [(ngModel)]="model.SessionVideo" placeholder="https://www.youtube.com/watch?v=..." />
            </div>

            <!-- Description -->
            <div class="field field-col">
              <span class="label">{{ 'description_lbl' | t }}</span>
              <textarea class="textarea" name="Description" [(ngModel)]="model.Description" rows="3" [placeholder]="'add_short_desc' | t"></textarea>
            </div>

            <!-- File Uploads -->
            <div class="field">
              <span class="label">{{ 'session_tasks_pdf' | t }} <span class="optional">{{ 'optional_lbl' | t }}</span></span>
              <div class="dropzone" (click)="tasksInput.click()">
                <div class="dz-icon" aria-hidden="true">📄</div>
                <div class="dz-text">
                  <div class="dz-title">{{ 'click_choose_pdf' | t }}</div>
                  <div class="dz-sub">{{ 'allowed_ext' | t }}</div>
                </div>
                <input #tasksInput type="file" accept=".pdf,.doc,.docx" (change)="onFileChange($event, 'SessionTasks')" hidden />
              </div>
              <div class="preview" *ngIf="model.SessionTasks">
                <div class="file-pill">
                  <span class="name">{{ model.SessionTasks?.name }}</span>
                  <span class="size">{{ (model.SessionTasks?.size || 0) / 1024 | number:'1.0-0' }} KB</span>
                  <button type="button" class="remove" (click)="model.SessionTasks = null">إزالة</button>
                </div>
              </div>
            </div>

            <div class="field">
              <span class="label">{{ 'session_project_pdf' | t }} <span class="optional">{{ 'optional_lbl' | t }}</span></span>
              <div class="dropzone" (click)="projectInput.click()">
                <div class="dz-icon" aria-hidden="true">📄</div>
                <div class="dz-text">
                  <div class="dz-title">{{ 'click_choose_pdf' | t }}</div>
                  <div class="dz-sub">{{ 'allowed_ext' | t }}</div>
                </div>
                <input #projectInput type="file" accept=".pdf,.doc,.docx" (change)="onFileChange($event, 'SessionProject')" hidden />
              </div>
              <div class="preview" *ngIf="model.SessionProject">
                <div class="file-pill">
                  <span class="name">{{ model.SessionProject?.name }}</span>
                  <span class="size">{{ (model.SessionProject?.size || 0) / 1024 | number:'1.0-0' }} KB</span>
                  <button type="button" class="remove" (click)="model.SessionProject = null">إزالة</button>
                </div>
              </div>
            </div>

            <div class="field">
              <span class="label">{{ 'materials_pdf' | t }} <span class="optional">{{ 'optional_lbl' | t }}</span></span>
              <div class="dropzone" (click)="materialInput.click()">
                <div class="dz-icon" aria-hidden="true">📄</div>
                <div class="dz-text">
                  <div class="dz-title">{{ 'click_choose_pdf' | t }}</div>
                  <div class="dz-sub">{{ 'allowed_ext' | t }}</div>
                </div>
                <input #materialInput type="file" accept=".pdf,.doc,.docx" (change)="onFileChange($event, 'ScientificMaterial')" hidden />
              </div>
              <div class="preview" *ngIf="model.ScientificMaterial">
                <div class="file-pill">
                  <span class="name">{{ model.ScientificMaterial?.name }}</span>
                  <span class="size">{{ (model.ScientificMaterial?.size || 0) / 1024 | number:'1.0-0' }} KB</span>
                  <button type="button" class="remove" (click)="model.ScientificMaterial = null">إزالة</button>
                </div>
              </div>
            </div>

            <div class="field">
              <span class="label">{{ 'session_quiz_pdf' | t }} <span class="optional">{{ 'optional_lbl' | t }}</span></span>
              <div class="dropzone" (click)="quizInput.click()">
                <div class="dz-icon" aria-hidden="true">📄</div>
                <div class="dz-text">
                  <div class="dz-title">{{ 'click_choose_pdf' | t }}</div>
                  <div class="dz-sub">{{ 'allowed_ext' | t }}</div>
                </div>
                <input #quizInput type="file" accept=".pdf,.doc,.docx" (change)="onFileChange($event, 'SessionQuiz')" hidden />
              </div>
              <div class="preview" *ngIf="model.SessionQuiz">
                <div class="file-pill">
                  <span class="name">{{ model.SessionQuiz?.name }}</span>
                  <span class="size">{{ (model.SessionQuiz?.size || 0) / 1024 | number:'1.0-0' }} KB</span>
                  <button type="button" class="remove" (click)="model.SessionQuiz = null">إزالة</button>
                </div>
              </div>
            </div>
          </div>

          <div class="actions">
            <button class="btn btn-primary" type="submit" [disabled]="saving || !f.form.valid || !model.ProgramsContentMasterId">
              {{ saving ? ('saving_dots' | t) : ('save_btn' | t) }}
            </button>
            <button class="btn btn-secondary" type="button" (click)="resetForm(f)">{{ 'cancel_btn2' | t }}</button>
          </div>

          <div *ngIf="success" class="alert success">
            <div class="success-content">
              <div class="success-icon">✓</div>
              <div class="success-text">
                <div class="success-title">{{ 'saved_success' | t }}</div>
                <div class="success-subtitle">{{ 'redirect_home_2s' | t }}</div>
              </div>
            </div>
          </div>
          <div *ngIf="error" class="alert error">{{ 'save_failed_prefix' | t }} {{ error }}</div>
        </form>
      </div>
    </section>
  `,
  styles: [`
    .container{padding:24px;max-width:920px}
    .header{margin: 6px 0 16px}
    .header h1{margin:0 0 6px 0}
    .upload-card{background:#fff;border:1px solid var(--border);border-radius:14px;box-shadow: var(--shadow);padding:18px}

    .form{display:block}
    .grid{display:grid;grid-template-columns:1fr;gap:14px}
    .field{display:grid;gap:8px}
    .field-col{grid-column:1/-1}
    .label{color:#34495e;font-weight:600}
    .optional{color:#6b7280;font-weight:400;font-size:0.9em}
    .input,.textarea,select{width:100%;border:1.5px solid var(--border);border-radius:10px;padding:12px 14px;font-size:14px;outline:none;transition:box-shadow .2s,border-color .2s;background:#fff}
    .input:focus,.textarea:focus,select:focus{border-color: var(--primary);box-shadow:0 0 0 3px rgba(42,118,210,.12)}

    .dropzone{display:flex;align-items:center;gap:12px;border:1.5px dashed var(--border);background:#f9fbff;border-radius:12px;padding:16px;cursor:pointer}
    .dropzone:hover{border-color: var(--primary)}
    .dz-icon{font-size:22px}
    .dz-title{font-weight:600}
    .dz-sub{color:#5f6c72;font-size:12px}

    .preview{margin-top:10px}
    .file-pill{display:inline-flex;gap:8px;align-items:center;background:#eef5ff;border:1px solid #d6e6ff;color:#2a4a7b;padding:6px 10px;border-radius:999px}
    .file-pill .size{opacity:.8;font-size:12px}
    .file-pill .remove{border:none;background:transparent;color:#b00020;cursor:pointer}

    .actions{display:flex;gap:10px;justify-content:flex-start;margin-top:14px}
    .btn{border:none;border-radius:10px;padding:10px 16px;cursor:pointer;font-weight:600}
    .btn-primary{background: var(--primary);color:#fff}
    .btn-primary:disabled{opacity:.6;cursor:not-allowed}
    .btn-secondary{background:#f0f2f5}

    .alert{margin-top:12px;padding:10px 12px;border-radius:8px}
    .alert.success{background:#e8f5e9;border:1px solid #a5d6a7;color:#1b5e20}
    .alert.error{background:#fdecea;border:1px solid #f5c6cb;color:#842029}
    
    .success-content{display:flex;align-items:center;gap:12px}
    .success-icon{font-size:20px;font-weight:bold;color:#2e7d32}
    .success-text{flex:1}
    .success-title{font-weight:600;font-size:16px;margin-bottom:4px}
    .success-subtitle{font-size:14px;opacity:0.8}

    @media (min-width: 900px){
      .grid{grid-template-columns:1fr 1fr}
      .field-col{grid-column:1/-1}
    }
  `]
})
export class ContentUploadComponent implements OnInit {
  model: any = { 
    ProgramsContentMasterId: '', 
    SessionVideo: '', 
    Description: '',
    SessionTasks: null,
    SessionProject: null,
    ScientificMaterial: null,
    SessionQuiz: null
  };
  masters: any[] = [];
  loading = false;
  saving = false;
  success = false;
  error: string | null = null;

  constructor(private api: ApiService, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.loadMasters();
  }

  loadMasters() {
    this.loading = true;
    this.api.getProgramsContentMaster().subscribe({
      next: (res: any) => {
        this.masters = Array.isArray(res) ? res : [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading masters:', err);
        this.masters = [];
        this.loading = false;
      }
    });
  }

  onFileChange(e: Event, field: string) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.model[field] = input.files[0];
    } else {
      this.model[field] = null;
    }
  }

  submit() {
    if (!this.model.ProgramsContentMasterId) {
      alert('اختر البرنامج الرئيسي');
      return;
    }

    this.saving = true;
    this.success = false;
    this.error = null;

    // Send plain object; service will construct FormData (to match React page behavior)
    this.api.createProgramsContentDetail(this.model).subscribe({
      next: _ => {
        this.saving = false;
        this.resetForm();
        alert('تم الحفظ بنجاح');
      },
      error: err => {
        this.saving = false;
        this.error = err?.message || 'فشل حفظ المحتوى';
      }
    });
  }

  resetForm(f?: any){
    this.model = { 
      ProgramsContentMasterId: '', 
      SessionVideo: '', 
      Description: '',
      SessionTasks: null,
      SessionProject: null,
      ScientificMaterial: null,
      SessionQuiz: null
    };
    this.success = false;
    this.error = null;
    if (f?.resetForm) f.resetForm();
  }
}
