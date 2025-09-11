import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { combineLatest, Subscription } from 'rxjs';

@Component({
  selector: 'app-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.css']
})
export class ProgramsComponent implements OnInit, OnDestroy {
  loading = false;
  error: string | null = null;
  programs: any[] = [];
  showAddForm = false;
  editingProgram: any = null;
  programMasters: any[] = [];
  isAdmin = false;
  private subs: Subscription[] = [];
  newProgram = {
    programNameL1: '',
    programNameL2: '',
    description: '',
    level: '',
    imageUrl: '',
    programMasterId: ''
  };

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    const s = combineLatest([this.auth.isAuthenticated$, this.auth.roles$]).subscribe(([isAuth, roles]) => {
      const normalized = (roles || []).map(r => String(r).toLowerCase());
      const isAdminRole = normalized.some(r => ['admin', 'administrator', 'superadmin', 'supportagent'].includes(r));
      this.isAdmin = !!isAuth && isAdminRole;
    });
    this.subs.push(s);
    this.fetchPrograms();
    this.fetchProgramMasters();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private fetchPrograms(): void {
    this.loading = true;
    this.error = null;
    this.api.getProgramsDetail().subscribe({
      next: (res) => {
        console.log('programs raw response', res);
        const arr = Array.isArray(res)
          ? res
          : (res?.items || res?.data || res?.result || res?.programs || []);
        this.programs = (Array.isArray(arr) ? arr : []).map((p: any) => ({
          id: p.id || p.programId || p.uid,
          title: p.programNameL1 || p.programNameL2 || p.title || p.name || p.programName || p.programTitle || 'برنامج بدون عنوان',
          description: p.description || p.summary || p.programDescription || '',
          level: p.level || p.skillLevel || 'غير محدد',
          imageUrl: p.imageUrl || p.thumbnail || null,
          programMasterId:
            p.programsContentMasterId ||
            p.ProgramsContentMasterId ||
            (p.programsContentMaster && (p.programsContentMaster.id || p.programsContentMaster.masterId)) ||
            (p.contentMaster && (p.contentMaster.id || p.contentMaster.masterId)) ||
            p.masterId || p.contentMasterId || ''
        }));

        // Fallback: if ProgramsDetail yields no items, use ProgramsContentMaster
        if (!this.programs.length) {
          this.api.getProgramsContentMaster().subscribe({
            next: (pcm) => {
              console.log('programs fallback ProgramsContentMaster raw', pcm);
              const arr2 = Array.isArray(pcm) ? pcm : (pcm?.items || pcm?.data || pcm?.result || []);
              this.programs = (Array.isArray(arr2) ? arr2 : []).map((x: any) => ({
                id: x.id || x.masterId || x.contentId || x.uid,
                title: x.sessionNameL1 || x.sessionNameL2 || x.title || 'برنامج/جلسة',
                description: x.description || '',
                level: x.level || 'غير محدد',
                imageUrl: x.imageUrl || null,
              }));
            },
            error: (err) => console.error('getProgramsContentMaster error', err),
            complete: () => { this.loading = false; }
          });
          return;
        }
      },
      error: (err) => {
        console.error('getProgramsDetail error', err);
        // Try fallback if unauthorized or any failure
        this.api.getProgramsContentMaster().subscribe({
          next: (pcm) => {
            console.log('programs fallback (error path) ProgramsContentMaster raw', pcm);
            const arr2 = Array.isArray(pcm) ? pcm : (pcm?.items || pcm?.data || pcm?.result || []);
            this.programs = (Array.isArray(arr2) ? arr2 : []).map((x: any) => ({
              id: x.id || x.masterId || x.contentId || x.uid,
              title: x.sessionNameL1 || x.sessionNameL2 || x.title || 'برنامج/جلسة',
              description: x.description || '',
              level: x.level || 'غير محدد',
              imageUrl: x.imageUrl || null,
              programMasterId: x.id || x.masterId || x.contentId || ''
            }));
          },
          error: (e2) => {
            this.error = 'تعذر جلب البرامج.';
            console.error('ProgramsContentMaster fallback error', e2);
          },
          complete: () => { this.loading = false; }
        });
        return;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private fetchProgramMasters(): void {
    this.api.getProgramsContentMaster().subscribe({
      next: (res) => {
        const arr = Array.isArray(res) ? res : (res?.items || res?.data || res?.result || res?.programs || []);
        this.programMasters = (Array.isArray(arr) ? arr : []).map((m: any) => ({
          id: m.id || m.masterId || m.contentId || m.uid,
          title: m.sessionNameL1 || m.sessionNameL2 || m.title || m.name || 'Program Master'
        }));
        // Ensure a value is selected if empty
        this.setRandomMasterIfEmpty();
      },
      error: (err) => {
        console.error('Error fetching program masters', err);
      }
    });
  }

  // CRUD Operations
  addProgram(): void {
    this.showAddForm = true;
    this.editingProgram = null;
    this.resetNewProgram();
    // Auto-pick a random master if list already loaded
    this.setRandomMasterIfEmpty();
  }

  editProgram(program: any): void {
    this.editingProgram = program;
    this.showAddForm = true;
    this.newProgram = {
      programNameL1: program.title || '',
      programNameL2: program.title || '',
      description: program.description || '',
      level: program.level || '',
      imageUrl: program.imageUrl || '',
      programMasterId: program.programMasterId || ''
    };
    // If missing, auto-pick a random master
    this.setRandomMasterIfEmpty();
  }

  deleteProgram(program: any): void {
    if (confirm('هل أنت متأكد من حذف هذا البرنامج؟')) {
      this.loading = true;
      this.api.deleteProgramsDetail(program.id).subscribe({
        next: () => {
          this.fetchPrograms();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error deleting program:', err);
          this.error = 'حدث خطأ أثناء حذف البرنامج';
          this.loading = false;
        }
      });
    }
  }

  saveProgram(): void {
    if (this.editingProgram) {
      this.updateProgram();
    } else {
      this.createProgram();
    }
  }

  private createProgram(): void {
    const name = (this.newProgram.programNameL1 || '').trim();
    if (!name || name.length < 3 || name.length > 70) {
      this.error = 'Program name must be 3-70 characters.';
      return;
    }
    if (!this.newProgram.programMasterId) {
      this.error = 'Please select a Program Master.';
      return;
    }
    this.loading = true;
    const payload: any = {};
    payload.ProgramNameL1 = name;
    if ((this.newProgram.programNameL2 || '').trim()) {
      payload.ProgramNameL2 = (this.newProgram.programNameL2 || '').trim();
    }
    if ((this.newProgram.description || '').trim()) {
      payload.Description = (this.newProgram.description || '').trim();
    }
    // Note: Backend validation refers to ProgramNameL1. Avoid sending SessionNo unless required.
    // Keep master id as UUID string if present
    if (this.newProgram.programMasterId) {
      payload.ProgramsContentMasterId = this.newProgram.programMasterId;
    }
    console.log('create ProgramsDetail payload', payload);
    this.api.createProgramsDetail(payload).subscribe({
      next: () => {
        this.fetchPrograms();
        this.cancelForm();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error creating program:', err, err?.error?.errors || err?.error);
        this.error = 'فشل إنشاء البرنامج. تأكد من الحقول المطلوبة.';
        this.loading = false;
      }
    });
  }

  private updateProgram(): void {
    const name = (this.newProgram.programNameL1 || '').trim();
    if (!name || name.length < 3 || name.length > 70) {
      this.error = 'Program name must be 3-70 characters.';
      return;
    }
    if (!this.newProgram.programMasterId) {
      this.error = 'Please select a Program Master.';
      return;
    }
    this.loading = true;
    const targetId = this.editingProgram?.id;
    if (!targetId) {
      this.error = 'معرّف البرنامج غير معروف.';
      this.loading = false;
      return;
    }
    // Do not include ProgramsContentMasterId in update to avoid EF key/principal change errors
    const payload: any = {
      ProgramNameL1: name
    };
    if ((this.newProgram.programNameL2 || '').trim()) payload.ProgramNameL2 = (this.newProgram.programNameL2 || '').trim();
    if ((this.newProgram.description || '').trim()) payload.Description = (this.newProgram.description || '').trim();
    console.log('update ProgramsDetail payload', payload);
    this.api.updateProgramsDetail(targetId, payload).subscribe({
      next: () => {
        this.fetchPrograms();
        this.cancelForm();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error updating program (ProgramsDetail):', err, err?.error?.errors || err?.error);
        this.error = 'فشل تحديث البرنامج. تأكد من الحقول المطلوبة.';
        this.loading = false;
      }
    });
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.editingProgram = null;
    this.resetNewProgram();
  }

  private resetNewProgram(): void {
    this.newProgram = {
      programNameL1: '',
      programNameL2: '',
      description: '',
      level: '',
      imageUrl: '',
      programMasterId: ''
    };
  }

  private setRandomMasterIfEmpty(): void {
    if (!this.newProgram.programMasterId && Array.isArray(this.programMasters) && this.programMasters.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.programMasters.length);
      const pick = this.programMasters[randomIndex];
      if (pick && pick.id) {
        this.newProgram.programMasterId = pick.id;
      }
    }
  }
}
