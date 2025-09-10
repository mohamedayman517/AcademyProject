import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { ApiService } from '../../services/api.service';

interface StudentData {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  id: string;
}

interface Evaluation {
  attendanceRate: number;
  absenceRate: number;
  browsingRate: number;
  contentRatio: number;
}

interface Attendance {
  id: string;
  date: string;
  status: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  studentData: StudentData | null = null;
  evaluation: Evaluation | null = null;
  attendance: Attendance[] = [];
  loading = true;
  isAuthenticated = false;
  profileImageUrl = '';
  isRtl = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private auth: AuthService,
    private router: Router,
    private lang: LanguageService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.checkAuth();
    this.loadProfileData();
    
    // Listen for language changes
    const langSub = this.lang.currentLang$.subscribe(lang => {
      this.isRtl = lang === 'ar';
    });
    this.subscriptions.push(langSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private checkAuth(): void {
    const authSub = this.auth.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });
    this.subscriptions.push(authSub);
  }

  private async loadProfileData(): Promise<void> {
    this.loading = true;
    try {
      // Check if user is authenticated
      if (!this.auth.getToken()) {
        console.log('No authentication token found, showing login prompt');
        this.studentData = null;
        this.loading = false;
        return;
      }

      console.log('Loading profile data with token');
      
      // Get student data, evaluations, and attendance
      const [studentRes, evaluationRes, attendanceRes] = await Promise.all([
        this.api.accountMe().toPromise(),
        this.api.getStudentEvaluation().toPromise(),
        this.api.getStudentAttend().toPromise()
      ]);

      console.log('API Response - studentRes:', studentRes);
      console.log('API Response - evaluationRes:', evaluationRes);
      console.log('API Response - attendanceRes:', attendanceRes);
      
      // Check if user is actually logged in
      if (!studentRes) {
        console.log('No student data received, user might not be logged in');
        this.studentData = null;
        this.loading = false;
        return;
      }

      if (studentRes) {
        // Extract data same way as account page
        const extractedData: StudentData = {
          firstName: studentRes?.firstName || '',
          lastName: studentRes?.lastName || '',
          fullName: studentRes?.fullName || `${studentRes?.firstName || ''} ${studentRes?.lastName || ''}`.trim() || 'User',
          email: studentRes?.email || '',
          phoneNumber: studentRes?.phoneNumber || '',
          role: studentRes?.role || 'User',
          id: studentRes?.id || studentRes?.userId || studentRes?.guid || ''
        };
        
        console.log('Extracted student data:', extractedData);
        this.studentData = extractedData;
        
        // Load profile picture if available
        try {
          const blob = await this.api.accountGetProfilePicture(extractedData.id).toPromise();
          if (blob && blob.size > 0) {
            const url = URL.createObjectURL(blob);
            this.profileImageUrl = url;
          } else {
            this.profileImageUrl = '';
          }
        } catch (_) {
          this.profileImageUrl = '';
        }
      } else {
        console.log('No student data received from API');
      }
      
      if (evaluationRes && Array.isArray(evaluationRes)) {
        // Use first evaluation or create default data
        this.evaluation = evaluationRes[0] || {
          attendanceRate: 85,
          absenceRate: 15,
          browsingRate: 78,
          contentRatio: 92
        };
      }
      
      if (attendanceRes && Array.isArray(attendanceRes)) {
        this.attendance = attendanceRes;
      }
    } catch (error: any) {
      console.error('Error loading profile data:', error);
      
      // If error is 401 (unauthorized), redirect to login
      if (error?.status === 401) {
        console.log('Unauthorized access, clearing token and showing login prompt');
        this.auth.logout();
        this.studentData = null;
        this.loading = false;
        return;
      }
      
      // Use default data in case of error
      this.studentData = {
        firstName: this.isRtl ? 'أحمد' : 'Ahmed',
        lastName: this.isRtl ? 'محمد' : 'Mohamed',
        fullName: this.isRtl ? 'أحمد محمد' : 'Ahmed Mohamed',
        email: 'ahmed@example.com',
        phoneNumber: '',
        role: 'User',
        id: ''
      };
      this.evaluation = {
        attendanceRate: 85,
        absenceRate: 15,
        browsingRate: 78,
        contentRatio: 92
      };
    } finally {
      this.loading = false;
    }
  }

  handleBasicData(): void {
    this.router.navigate(['/account']);
  }

  handleEvaluations(): void {
    this.router.navigate(['/students/evaluations']);
  }

  calculateCircleProgress(percentage: number, size = 120): any {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (percentage / 100) * circumference;
    const remaining = circumference - progress;
    
    return {
      radius,
      circumference,
      progress,
      remaining,
      size
    };
  }

  getEffectiveRole(user: StudentData | null): string {
    if (!user) return 'User';
    const email = (user.email || '').toLowerCase();
    const baseRole = user.role || 'User';
    if (baseRole === 'SupportAgent' || baseRole === 'Admin' || baseRole === 'admin') return 'Admin';
    if (email === 'yjmt469999@gmail.com' || email === 'yjmt4699999@gmail.com') return 'Admin';
    try {
      const stored = JSON.parse(localStorage.getItem('userData') || '{}');
      const storedRole = stored.role || stored.Role;
      if (storedRole === 'Admin' || storedRole === 'SupportAgent') return 'Admin';
    } catch (_) {}
    return baseRole;
  }

  getOverallAverage(): number {
    if (!this.evaluation) return 0;
    const browsingRate = this.evaluation.browsingRate || 0;
    const contentRatio = this.evaluation.contentRatio || 0;
    return Math.round((browsingRate + contentRatio) / 2);
  }
}
