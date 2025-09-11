import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-students-evaluations',
  templateUrl: './students-evaluations.component.html',
  styleUrls: ['./students-evaluations.component.css']
})
export class StudentsEvaluationsComponent implements OnInit {
  loading = true;
  error: string | null = null;
  isRtl = false;

  // Data
  students: any[] = [];
  evaluations: any[] = [];

  // Form state
  studentId = '';
  date = '';
  attendanceRate = '80';
  browsingRate = '80';
  contentRatio = '80';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    try { this.isRtl = (localStorage.getItem('lang') || 'en') === 'ar'; } catch {}
    this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const [st, ev] = await Promise.all([
        this.api.getStudents().toPromise().catch(() => []),
        this.api.getEvaluations().toPromise().catch(() => [])
      ]);
      this.students = Array.isArray(st) ? st : [];
      this.evaluations = Array.isArray(ev) ? ev : [];
    } catch (_) {
      this.students = [];
      this.evaluations = [];
    } finally {
      this.loading = false;
    }
  }

  get studentOptions(): { id: string; name: string; email: string }[] {
    const raw = Array.isArray(this.students) ? this.students : [];
    const byName = new Map<string, { id: string; name: string; email: string }>();
    for (const s of raw) {
      const id = s?.id ?? s?.Id ?? null;
      if (id === null || id === undefined) continue;
      const nameParts = [s?.firstName || s?.FirstName || '', s?.lastName || s?.LastName || ''].join(' ').trim();
      const name = s?.fullName || s?.studentNameL1 || s?.StudentNameL1 || s?.studentNameL2 || s?.StudentNameL2 || nameParts || (this.isRtl ? 'طالب' : 'Student');
      const email = s?.email || s?.Email || '';
      const key = String(name).trim().toLowerCase();
      if (!byName.has(key)) {
        byName.set(key, { id: String(id), name: String(name), email: String(email) });
      }
    }
    return Array.from(byName.values()).sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }

  private getEvaluationStudentId(r: any): string | null {
    if (!r || typeof r !== 'object') return null;
    const val = r.studentDataId ?? r.StudentDataId ?? r.StudentsDataId ?? r.studentId ?? r.StudentId ?? (r.student && (r.student.id ?? r.student.Id));
    return val !== undefined && val !== null ? String(val) : null;
  }

  get recordsToShow(): any[] {
    const raw = Array.isArray(this.evaluations) ? this.evaluations : [];
    if (!this.studentId) return raw;
    return raw.filter(rec => String(this.getEvaluationStudentId(rec)) === String(this.studentId));
  }

  async onSubmit(e?: Event): Promise<void> {
    if (e) e.preventDefault();
    if (!this.studentId) return;
    try {
      const selected = this.students.find(s => [s?.id, s?.Id, s?.guid, s?.Guid, s?.studentsDataId, s?.StudentsDataId, s?.studentBarCode, s?.StudentBarCode, s?.studentCode, s?.StudentCode]
        .some(v => v !== undefined && v !== null && String(v) === String(this.studentId))
      );
      const preferredNumericId = (selected as any)?.id ?? (selected as any)?.Id ?? (selected as any)?.studentsDataId ?? (selected as any)?.StudentsDataId;
      const resolvedStudentId = (typeof preferredNumericId === 'number' && Number.isFinite(preferredNumericId))
        ? preferredNumericId
        : ((String(preferredNumericId || '').match(/^\d+$/)) ? Number(preferredNumericId) : ((selected as any)?.guid ?? (selected as any)?.Guid ?? this.studentId));

      await this.api.createEvaluation({
        studentDataId: resolvedStudentId,
        date: this.date || new Date().toISOString(),
        attendanceRate: Number(this.attendanceRate),
        browsingRate: Number(this.browsingRate),
        contentRatio: Number(this.contentRatio)
      }).toPromise();

      const ev = await this.api.getEvaluations().toPromise().catch(() => []);
      this.evaluations = Array.isArray(ev) ? ev : [];
      this.studentId = '';
      this.date = '';
      this.attendanceRate = '80';
      this.browsingRate = '80';
      this.contentRatio = '80';
    } catch (_) {}
  }
}

