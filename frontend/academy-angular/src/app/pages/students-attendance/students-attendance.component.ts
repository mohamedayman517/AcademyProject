import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-students-attendance',
  templateUrl: './students-attendance.component.html',
  styleUrls: ['./students-attendance.component.css']
})
export class StudentsAttendanceComponent implements OnInit {
  // UI/state
  loading = true;
  error: string | null = null;
  isRtl = false;

  // Data
  students: any[] = [];
  attendance: any[] = [];

  // Form state
  studentId = '';
  dateAttend = '';
  attendAccept = 'true';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    try { this.isRtl = (localStorage.getItem('lang') || 'en') === 'ar'; } catch {}
    this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const [st, at] = await Promise.all([
        this.api.getStudents().toPromise().catch(() => []),
        this.api.getAttendance().toPromise().catch(() => [])
      ]);
      this.students = Array.isArray(st) ? st : [];
      this.attendance = Array.isArray(at) ? at : [];
    } catch (e) {
      this.students = [];
      this.attendance = [];
    } finally {
      this.loading = false;
    }
  }

  get studentOptions(): { id: string; name: string; email: string }[] {
    const raw = Array.isArray(this.students) ? this.students : [];
    const toId = (s: any): string => {
      const candidate = s?.id ?? s?.Id ?? s?.studentsDataId ?? s?.StudentsDataId ?? s?.guid ?? s?.Guid ?? s?.studentBarCode ?? s?.StudentBarCode ?? s?.studentCode ?? s?.StudentCode;
      return candidate !== undefined && candidate !== null ? String(candidate) : String(raw.indexOf(s));
    };
    return raw.map(s => {
      const nameParts = [s?.firstName || s?.FirstName || '', s?.lastName || s?.LastName || ''].join(' ').trim();
      const name = s?.fullName || s?.studentNameL1 || s?.StudentNameL1 || s?.studentNameL2 || s?.StudentNameL2 || nameParts || (this.isRtl ? 'طالب' : 'Student');
      const email = s?.email || s?.Email || '';
      return { id: toId(s), name: String(name), email: String(email) };
    });
  }

  private getAttendanceStudentId(r: any): string | null {
    if (!r || typeof r !== 'object') return null;
    const val = r.studentDataId ?? r.StudentDataId ?? r.StudentsDataId ?? r.studentId ?? r.StudentId ?? (r.student && (r.student.id ?? r.student.Id));
    return val !== undefined && val !== null ? String(val) : null;
  }

  get recordsToShow(): any[] {
    const raw = Array.isArray(this.attendance) ? this.attendance : [];
    if (!this.studentId) return raw;
    return raw.filter(rec => String(this.getAttendanceStudentId(rec)) === String(this.studentId));
  }

  async onSubmit(e?: Event): Promise<void> {
    if (e) e.preventDefault();
    if (!this.studentId || !this.dateAttend) return;
    try {
      const selected = this.students.find(s => [s?.id, s?.Id, s?.guid, s?.Guid, s?.studentsDataId, s?.StudentsDataId, s?.studentBarCode, s?.StudentBarCode, s?.studentCode, s?.StudentCode]
        .some(v => v !== undefined && v !== null && String(v) === String(this.studentId))
      );
      const preferredNumericId = (selected as any)?.id ?? (selected as any)?.Id ?? (selected as any)?.studentsDataId ?? (selected as any)?.StudentsDataId;
      const resolvedStudentId = (typeof preferredNumericId === 'number' && Number.isFinite(preferredNumericId))
        ? preferredNumericId
        : ((String(preferredNumericId || '').match(/^\d+$/)) ? Number(preferredNumericId) : ((selected as any)?.guid ?? (selected as any)?.Guid ?? this.studentId));
      await this.api.createStudentAttend({
        studentDataId: resolvedStudentId,
        dateAttend: this.dateAttend,
        attendAccept: this.attendAccept === 'true'
      }).toPromise();
      const at = await this.api.getAttendance().toPromise().catch(() => []);
      this.attendance = Array.isArray(at) ? at : [];
      this.studentId = '';
      this.dateAttend = '';
      this.attendAccept = 'true';
    } catch (err) {
      // Swallow errors to mirror minimal behavior
    }
  }
}

