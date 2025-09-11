import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface Evaluation {
  id: string;
  studentDataId: string;
  attendanceRate: number;
  absenceRate: number;
  browsingRate: number;
  contentRatio: number;
  date: string;
}

interface Attendance {
  id: string;
  studentDataId: string;
  dateAttend: string;
  attendAccept: boolean;
}

interface Student {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
}

interface StudentOption {
  id: string;
  name: string;
  email: string;
}

@Component({
  selector: 'app-evaluations',
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.css']
})
export class EvaluationsComponent implements OnInit {
  isRtl = false;
  evaluations: Evaluation[] = [];
  attendance: Attendance[] = [];
  students: Student[] = [];
  loading = true;
  studentId = '';
  openStudent = false;
  studentQuery = '';
  Math = Math; // Make Math available in template

  constructor(
    private languageService: LanguageService,
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isRtl = this.languageService.current === 'ar';
    this.loadEvaluationsData();
  }

  async loadEvaluationsData(): Promise<void> {
    this.loading = true;
    try {
      // محاولة جلب البيانات من API
      const [evaluationsRes, attendanceRes, studentsRes] = await Promise.all([
        firstValueFrom(this.apiService.getEvaluations().pipe(catchError(() => of([])))),
        firstValueFrom(this.apiService.getAttendance().pipe(catchError(() => of([])))),
        firstValueFrom(this.apiService.getStudents().pipe(catchError(() => of([]))))
      ]);

      if (evaluationsRes && Array.isArray(evaluationsRes)) {
        this.evaluations = evaluationsRes;
      }
      if (attendanceRes && Array.isArray(attendanceRes)) {
        this.attendance = attendanceRes;
      }
      if (Array.isArray(studentsRes)) {
        this.students = studentsRes;
      }
    } catch (error) {
      console.error('Error loading evaluations data:', error);
      // استخدام بيانات تجريبية في حالة الخطأ
      this.evaluations = [
        {
          id: '1',
          studentDataId: '1',
          attendanceRate: 85,
          absenceRate: 15,
          browsingRate: 78,
          contentRatio: 92,
          date: '2024-01-15'
        },
        {
          id: '2',
          studentDataId: '1',
          attendanceRate: 90,
          absenceRate: 10,
          browsingRate: 85,
          contentRatio: 88,
          date: '2024-01-08'
        }
      ];
      this.attendance = [
        {
          id: '1',
          studentDataId: '1',
          dateAttend: '2024-01-15',
          attendAccept: true
        },
        {
          id: '2',
          studentDataId: '1',
          dateAttend: '2024-01-14',
          attendAccept: true
        },
        {
          id: '3',
          studentDataId: '1',
          dateAttend: '2024-01-13',
          attendAccept: false
        }
      ];
    } finally {
      this.loading = false;
    }
  }

  getGradeColor(percentage: number): string {
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 80) return 'text-blue-400';
    if (percentage >= 70) return 'text-yellow-400';
    if (percentage >= 60) return 'text-orange-400';
    return 'text-orange-400';
  }

  getGradeLabel(percentage: number): string {
    if (percentage >= 90) return this.isRtl ? 'ممتاز' : 'Excellent';
    if (percentage >= 80) return this.isRtl ? 'جيد جداً' : 'Very Good';
    if (percentage >= 70) return this.isRtl ? 'جيد' : 'Good';
    if (percentage >= 60) return this.isRtl ? 'مقبول' : 'Acceptable';
    return this.isRtl ? 'ضعيف' : 'Poor';
  }

  get studentOptions(): StudentOption[] {
    const raw = Array.isArray(this.students) ? this.students : [];
    const byName = new Map();
    for (const s of raw) {
      const id = s.id ?? null;
      if (id === null || id === undefined) continue;
      const nameParts = [s.firstName || '', s.lastName || '']
        .join(' ')
        .trim();
      const name = s.fullName || nameParts || (this.isRtl ? 'طالب' : 'Student');
      const email = s.email || '';
      const key = String(name).trim().toLowerCase();
      if (!byName.has(key)) {
        byName.set(key, { id, name, email });
      }
    }
    return Array.from(byName.values()).sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }

  get filteredStudentOptions(): StudentOption[] {
    const q = String(this.studentQuery || '').toLowerCase().trim();
    if (!q) return this.studentOptions;
    return this.studentOptions.filter(opt =>
      String(opt.name).toLowerCase().includes(q) || String(opt.email || '').toLowerCase().includes(q)
    );
  }

  get selectedStudent(): StudentOption | null {
    return this.studentOptions.find(o => String(o.id) === String(this.studentId)) || null;
  }

  getRecStudentId(r: any): string | null {
    return r?.studentDataId ?? r?.StudentDataId ?? r?.StudentsDataId ??
      r?.studentId ?? r?.StudentId ??
      (r?.student && (r.student.id ?? r.student.Id)) ?? null;
  }

  get evalsToShow(): Evaluation[] {
    const raw = Array.isArray(this.evaluations) ? this.evaluations : [];
    if (!this.studentId) return raw;
    return raw.filter((rec) => String(this.getRecStudentId(rec)) === String(this.studentId));
  }

  get attendanceToShow(): Attendance[] {
    const raw = Array.isArray(this.attendance) ? this.attendance : [];
    if (!this.studentId) return raw;
    return raw.filter((rec) => String(this.getRecStudentId(rec)) === String(this.studentId));
  }

  onStudentSelect(studentId: string): void {
    this.studentId = studentId;
    this.openStudent = false;
  }

  goBack(): void {
    try {
      window.history.back();
    } catch {
      this.router.navigate(['/profile']);
    }
  }

  get translations() {
    return {
      back: this.isRtl ? 'العودة' : 'Back',
      title: this.isRtl ? 'التقييمات' : 'Evaluations',
      subtitle: this.isRtl 
        ? 'تابع تقييماتك وأداءك التعليمي عبر الزمن'
        : 'Track your evaluations and educational performance over time',
      student: this.isRtl ? 'الطالب' : 'Student',
      selectStudent: this.isRtl ? 'اختر طالباً' : 'Select a student',
      searchStudents: this.isRtl ? 'ابحث عن طالب...' : 'Search students...',
      noResults: this.isRtl ? 'لا نتائج' : 'No results found.',
      overallSummary: this.isRtl ? 'ملخص الأداء العام' : 'Overall Performance Summary',
      avgAttendance: this.isRtl ? 'متوسط الحضور' : 'Avg Attendance',
      avgBrowsing: this.isRtl ? 'متوسط التصفح' : 'Avg Browsing',
      avgContent: this.isRtl ? 'متوسط المحتوى' : 'Avg Content',
      overallAvg: this.isRtl ? 'المعدل العام' : 'Overall Avg',
      evaluationDetails: this.isRtl ? 'تفاصيل التقييمات' : 'Evaluation Details',
      evaluation: this.isRtl ? 'تقييم' : 'Evaluation',
      attendance: this.isRtl ? 'الحضور' : 'Attendance',
      browsing: this.isRtl ? 'التصفح' : 'Browsing',
      content: this.isRtl ? 'المحتوى' : 'Content',
      attendanceRecord: this.isRtl ? 'سجل الحضور' : 'Attendance Record',
      present: this.isRtl ? 'حضور' : 'Present',
      absent: this.isRtl ? 'غياب' : 'Absent',
      noEvaluationsStudent: this.isRtl ? 'لا توجد تقييمات لهذا الطالب' : 'No evaluations for this student',
      noEvaluations: this.isRtl ? 'لا توجد تقييمات متاحة حالياً' : 'No evaluations available at the moment',
      noAttendanceStudent: this.isRtl ? 'لا توجد سجلات حضور لهذا الطالب' : 'No attendance records for this student',
      noAttendance: this.isRtl ? 'لا توجد سجلات حضور متاحة' : 'No attendance records available',
      loading: this.isRtl ? 'جاري التحميل...' : 'Loading...'
    };
  }

  // ===== Computed helpers for template (avoid arrow functions in templates) =====
  private averageOf<K extends keyof Evaluation>(list: Evaluation[], key: K): number {
    if (!Array.isArray(list) || list.length === 0) return 0;
    const sum = list.reduce((acc: number, item: Evaluation) => acc + Number(item[key] || 0), 0);
    return Math.round(sum / list.length);
  }

  getAvgAttendance(): number {
    return this.averageOf(this.evalsToShow, 'attendanceRate');
  }

  getAvgBrowsing(): number {
    return this.averageOf(this.evalsToShow, 'browsingRate');
  }

  getAvgContent(): number {
    return this.averageOf(this.evalsToShow, 'contentRatio');
  }

  getOverallAverage(): number {
    if (!Array.isArray(this.evalsToShow) || this.evalsToShow.length === 0) return 0;
    const sum = this.evalsToShow.reduce((acc: number, item: Evaluation) => {
      const tripleAvg = ((item.attendanceRate || 0) + (item.browsingRate || 0) + (item.contentRatio || 0)) / 3;
      return acc + tripleAvg;
    }, 0);
    return Math.round(sum / this.evalsToShow.length);
  }
}
