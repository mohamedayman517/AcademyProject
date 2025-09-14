import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { map, take, retry, catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  children?: NavigationItem[];
  description?: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  searchQuery = '';
  openDropdown: string | null = null;
  openMobileDropdown: string | null = null;
  
  // Authentication observables
  isAuthenticated$: Observable<boolean>;
  userRole$: Observable<string | null>;
  userEmail$: Observable<string | null>;
  isAdmin$: Observable<boolean>;
  isStudent$: Observable<boolean>;
  
  // Student data
  studentAcademy: string | null = null;
  studentBranch: string | null = null;
  academies: any[] = [];
  branches: any[] = [];
  
  // Language
  isRtl$: Observable<boolean>;
  
  // Navigation items
  allNavigationItems: NavigationItem[] = [];
  
  private subscriptions: Subscription[] = [];

  constructor(
    private auth: AuthService,
    private router: Router,
    private lang: LanguageService,
    private api: ApiService
  ) {
    this.isAuthenticated$ = this.auth.isAuthenticated$;
    this.userRole$ = this.auth.roles$.pipe(
      map((roles: string[] = []) => {
        if (!roles || roles.length === 0) return null;
        return roles[0]; // Get first role
      })
    );
    this.userEmail$ = this.auth.userName$; // Assuming userName contains email
    this.isAdmin$ = this.auth.roles$.pipe(
      map((roles: string[] = []) => {
        const roleArray: string[] = roles || [];
        return roleArray.some(r => r.toLowerCase().includes('admin')) || 
               roleArray.some(r => r.toLowerCase().includes('administrator')) || 
               roleArray.some(r => r.toLowerCase().includes('superadmin')) ||
               roleArray.some(r => r.toLowerCase().includes('supportagent'));
      })
    );
    this.isStudent$ = this.auth.roles$.pipe(
      map((roles: string[] = []) => {
        const roleArray: string[] = roles || [];
        return roleArray.some(r => r.toLowerCase().includes('student')) || 
               roleArray.some(r => r.toLowerCase().includes('user')) ||
               roleArray.length === 0; // Default to student if no roles
      })
    );
    this.isRtl$ = this.lang.currentLang$.pipe(
      map(lang => lang === 'ar')
    );
  }

  ngOnInit(): void {
    // Set up navigation items based on authentication and roles
    this.setupNavigationItems();
    
    // Load student data when authenticated
    this.loadStudentData();
    
    // Listen for storage changes
    this.setupStorageListeners();
    
    // Load lists only when authenticated to avoid 401 on public pages
    const authSub = this.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.loadGlobalLists();
      }
    });
    this.subscriptions.push(authSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    // Ensure body scroll restored if component destroyed while menu open
    try { document.body.style.overflow = ''; } catch {}
  }

  private setupNavigationItems(): void {
    const navSub = combineLatest([
      this.isAuthenticated$,
      this.isAdmin$,
      this.isStudent$,
      this.lang.currentLang$
    ]).subscribe(([isAuthenticated, isAdmin, isStudent, lang]) => {
      this.allNavigationItems = this.buildNavigationItems(isAuthenticated, isAdmin, isStudent, lang);
    });
    this.subscriptions.push(navSub);
  }

  private buildNavigationItems(isAuthenticated: boolean, isAdmin: boolean, isStudent: boolean, lang: string): NavigationItem[] {
    if (!isAuthenticated) {
      return [];
    }

    const items: NavigationItem[] = [];

    // Admin navigation items
    if (isAdmin) {
      items.push({
        name: lang === 'ar' ? 'الدورات' : 'Courses',
        href: '/courses',
        icon: 'BookOpen',
        children: [
          { name: 'Project Master', href: '/projects', icon: 'Briefcase' },
          { name: 'Project Details', href: '/projects-details', icon: 'Briefcase' },
          { name: 'Program Details', href: '/programs', icon: 'BookOpen' },
          { name: 'Sessions', href: '/sessions', icon: 'BookOpen' }
        ]
      });

      items.push({
        name: lang === 'ar' ? 'الفيديوهات' : 'Videos',
        href: '/videos',
        icon: 'BookOpen'
      });

      items.push({
        name: lang === 'ar' ? 'الطلاب' : 'Students',
        href: '/students',
        icon: 'Users',
        children: [
          { name: lang === 'ar' ? 'شاشة إدخال بيانات الطلاب' : 'Student Data Entry', href: '/students/data', icon: 'Users' },
          { name: lang === 'ar' ? 'شاشة الحضور والانصراف' : 'Attendance Screen', href: '/students/attendance', icon: 'Users' },
          { name: lang === 'ar' ? 'شاشة التقييمات' : 'Evaluations Screen', href: '/students/evaluations', icon: 'Users' }
        ]
      });

      items.push({
        name: lang === 'ar' ? 'الخدمات' : 'Services',
        href: '/services',
        icon: 'Briefcase'
      });

      items.push({
        name: lang === 'ar' ? 'المدربين' : 'Trainers',
        href: '/trainers',
        icon: 'Users'
      });

      items.push({
        name: lang === 'ar' ? 'الوظائف' : 'Jobs',
        href: '/jobs',
        icon: 'Briefcase'
      });
    }

    // Student navigation items
    if (isStudent && this.studentAcademy && this.studentBranch) {
      items.push({
        name: lang === 'ar' ? 'المشاريع الرئيسية' : 'Project Master',
        href: `/projects?academy=${this.studentAcademy}&branch=${this.studentBranch}`,
        icon: 'Briefcase',
        description: lang === 'ar' ? 'إدارة المشاريع الرئيسية' : 'Manage main projects'
      });

      items.push({
        name: lang === 'ar' ? 'الجلسات' : 'Sessions',
        href: `/sessions?academy=${this.studentAcademy}&branch=${this.studentBranch}`,
        icon: 'BookOpen',
        description: lang === 'ar' ? 'عرض الجلسات التدريبية' : 'View training sessions'
      });

      items.push({
        name: lang === 'ar' ? 'الفيديوهات' : 'Videos',
        href: `/videos?academy=${this.studentAcademy}&branch=${this.studentBranch}`,
        icon: 'BookOpen',
        description: lang === 'ar' ? 'عرض الفيديوهات التعليمية' : 'View educational videos'
      });
    }

    return items;
  }

  private loadStudentData(): void {
    const studentSub = combineLatest([
      this.isAuthenticated$,
      this.userEmail$,
      this.isStudent$
    ]).subscribe(([isAuthenticated, userEmail, isStudent]) => {
      if (isAuthenticated && userEmail && isStudent) {
        this.loadStudentAcademyAndBranch(userEmail);
      }
    });
    this.subscriptions.push(studentSub);
  }

  private loadStudentAcademyAndBranch(userEmail: string): void {
    try {
      // Try to load from userSocialMedia first
      const storedSocialData = localStorage.getItem('userSocialMedia');
      if (storedSocialData) {
        const parsedData = JSON.parse(storedSocialData);
        if (parsedData.userEmail === userEmail) {
          this.studentAcademy = parsedData.academyDataId || null;
          this.studentBranch = parsedData.branchesDataId || null;
        }
      }

      // Also try to load from studentData
      const studentDataFromStorage = localStorage.getItem('studentData');
      if (studentDataFromStorage) {
        const parsedStudentData = JSON.parse(studentDataFromStorage);
        if (parsedStudentData.userEmail === userEmail) {
          if (parsedStudentData.academyDataId || parsedStudentData.AcademyDataId) {
            this.studentAcademy = parsedStudentData.academyDataId || parsedStudentData.AcademyDataId;
          }
          if (parsedStudentData.branchesDataId || parsedStudentData.BranchesDataId) {
            this.studentBranch = parsedStudentData.branchesDataId || parsedStudentData.BranchesDataId;
          }
        }
      }

      // Load academies and branches data for display names
      const academiesData = localStorage.getItem('academiesData');
      if (academiesData) {
        this.academies = JSON.parse(academiesData);
      }

      const branchesData = localStorage.getItem('branchesData');
      if (branchesData) {
        this.branches = JSON.parse(branchesData);
      }

      // Log current academy and branch information if warning message should appear
      this.logCurrentAcademyAndBranch();
    } catch (error) {
      console.log('Failed to load student data:', error);
    }
  }

  private loadGlobalLists(): void {
    // Fetch academies and branches and cache them for other components
    this.api.getAcademyData().pipe(
      retry(1),
      catchError((e) => {
        // Ignore aborted requests (status 0) usually caused by navigation/HMR
        if (e && e.status === 0) return EMPTY;
        throw e;
      })
    ).subscribe({
      next: (acads) => {
        this.academies = Array.isArray(acads) ? acads : (acads?.data || acads?.items || []);
        try { if (this.academies.length) localStorage.setItem('academiesData', JSON.stringify(this.academies)); } catch {}
      },
      error: (e) => { console.warn('Failed to load academies in header', e); }
    });
    this.api.getBranchesData().pipe(
      retry(1),
      catchError((e) => {
        if (e && e.status === 0) return EMPTY;
        throw e;
      })
    ).subscribe({
      next: (brs) => {
        this.branches = Array.isArray(brs) ? brs : (brs?.data || brs?.items || []);
        try { if (this.branches.length) localStorage.setItem('branchesData', JSON.stringify(this.branches)); } catch {}
      },
      error: (e) => { console.warn('Failed to load branches in header', e); }
    });
  }

  private setupStorageListeners(): void {
    // Listen for storage changes
    window.addEventListener('storage', (e) => {
      if (e.key === 'userSocialMedia' || e.key === 'studentData') {
        this.userEmail$.pipe(take(1)).subscribe(userEmail => {
          if (userEmail) {
            this.loadStudentAcademyAndBranch(userEmail);
            // Log after loading student data
            setTimeout(() => this.logCurrentAcademyAndBranch(), 100);
          }
        });
      }
    });

    // Listen for custom events
    window.addEventListener('student-data-changed', () => {
      this.userEmail$.pipe(take(1)).subscribe(userEmail => {
        if (userEmail) {
          this.loadStudentAcademyAndBranch(userEmail);
          // Log after loading student data
          setTimeout(() => this.logCurrentAcademyAndBranch(), 100);
        }
      });
    });
  }

  handleSearch(event: Event): void {
    event.preventDefault();
    if (this.searchQuery.trim()) {
      this.router.navigate(['/courses'], { 
        queryParams: { q: this.searchQuery.trim() } 
      });
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.handleSearch(event);
    }
  }

  setOpenDropdown(itemName: string | null): void {
    this.openDropdown = itemName;
  }

  toggleMobileDropdown(itemName: string): void {
    this.openMobileDropdown = this.openMobileDropdown === itemName ? null : itemName;
  }

  toggleMobileMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    // Lock body scroll on mobile when menu is open
    try {
      if (this.isMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    } catch {}
  }

  closeMobileMenu(): void {
    this.isMenuOpen = false;
    try { document.body.style.overflow = ''; } catch {}
  }

  // Close mobile menu on viewport resize to desktop to keep desktop unchanged
  onResize(): void {
    try {
      if (window.innerWidth >= 768 && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    } catch {}
  }

  isAdminItem(item: NavigationItem): boolean {
    // Check if item is admin-specific
    const adminItems = ['الدورات', 'Courses', 'الفيديوهات', 'Videos', 'الطلاب', 'Students', 'الخدمات', 'Services', 'المدربين', 'Trainers', 'الوظائف', 'Jobs'];
    return adminItems.includes(item.name);
  }

  getAcademyName(academyId: string): string {
    if (!academyId || !this.academies.length) return academyId;
    const aid = String(academyId);
    const academy = this.academies.find(a => String(a.id || a.Id) === aid);
    return academy ? (academy.academyNameL1 || academy.AcademyNameL1 || academy.academyNameL2 || academy.AcademyNameL2 || academy.name || aid) : aid;
  }

  getBranchName(branchId: string): string {
    if (!branchId || !this.branches.length) return branchId;
    const bid = String(branchId);
    const branch = this.branches.find(b => String(b.id || b.Id) === bid);
    return branch ? (branch.branchNameL1 || branch.BranchNameL1 || branch.branchNameL2 || branch.BranchNameL2 || branch.name || bid) : bid;
  }

  // Getters for template
  get isAuthenticated(): boolean {
    let result = false;
    this.isAuthenticated$.pipe(take(1)).subscribe(authenticated => {
      result = authenticated;
    });
    return result;
  }

  get isStudent(): boolean {
    let result = false;
    this.isStudent$.pipe(take(1)).subscribe(student => {
      result = student;
    });
    return result;
  }

  get isRtl(): boolean {
    let result = false;
    this.isRtl$.pipe(take(1)).subscribe(rtl => {
      result = rtl;
    });
    return result;
  }

  // Method to log current academy and branch information when warning message appears
  logCurrentAcademyAndBranch(): void {
    if (this.isStudent && this.isAuthenticated && (!this.studentAcademy || !this.studentBranch)) {
      console.log('=== Academy and Branch Selection Required ===');
      console.log('Current Student Academy ID:', this.studentAcademy || 'Not selected');
      console.log('Current Student Branch ID:', this.studentBranch || 'Not selected');
      
      if (this.studentAcademy) {
        const academyName = this.getAcademyName(this.studentAcademy);
        console.log('Current Academy Name:', academyName);
      }
      
      if (this.studentBranch) {
        const branchName = this.getBranchName(this.studentBranch);
        console.log('Current Branch Name:', branchName);
      }
      
      console.log('Available Academies:', this.academies.map(a => ({
        id: a.id,
        name: a.academyNameL1 || a.AcademyNameL1 || a.academyNameL2 || a.AcademyNameL2 || a.name
      })));
      
      console.log('Available Branches:', this.branches.map(b => ({
        id: b.id,
        name: b.branchNameL1 || b.BranchNameL1 || b.branchNameL2 || b.BranchNameL2 || b.name,
        academyId: b.academyDataId || b.AcademyDataId
      })));
      
      console.log('==========================================');
    }
  }
}
