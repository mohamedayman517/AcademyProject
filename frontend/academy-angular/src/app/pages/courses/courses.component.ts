import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  loading = false;
  error: string | null = null;
  view: 'grid' | 'list' = 'grid';
  categories = ['جميع الدورات','التكنولوجيا','الأعمال','التصميم','اللغات','تطوير الذات'];
  selectedCategory = 'جميع الدورات';
  query = '';
  debouncedQuery = '';
  courses: any[] = [];
  // New datasets for Catalog-style tabs
  projectMasters: any[] = [];
  projectDetails: any[] = [];
  programDetails: any[] = [];
  // Local defaults to render UI when unauthorized
  private defaultProjectMasters: any[] = [
    { id: 'pm-1', ProjectNameL1: 'مشروع تجريبي', Description: 'وصف مشروع تجريبي' },
    { id: 'pm-2', ProjectNameL1: 'Sample Project', Description: 'Sample project description' }
  ];
  private defaultProjectDetails: any[] = [
    { id: 'pd-1', ProjectNameL1: 'تفصيل تجريبي', Description: 'وصف تفصيلي تجريبي', ProjectsMasterId: 'pm-1' }
  ];
  private defaultPrograms: any[] = [
    { id: 'program-1', SessionNameL1: 'برنامج المهارات الشخصية', Description: 'برنامج شامل لتطوير المهارات الشخصية والمهنية', SessionNo: 1 },
    { id: 'program-2', SessionNameL1: 'Web Development Program', Description: 'Comprehensive program for modern web application development', SessionNo: 2 }
  ];
  // pagination
  page = 1;
  pageSize = 12;
  // Active tab (Catalog-style)
  activeTab: 'projectMasters' | 'projectDetails' | 'programDetails' = 'projectMasters';
  
  // Admin functionality
  isAdmin$: Observable<boolean>;
  showAddForm = false;
  showEditForm = false;
  editingCourse: any = null;
  
  // Reference data
  academies: any[] = [];
  branches: any[] = [];
  claseTypes: any[] = [];
  programsContentMaster: any[] = [];
  
  // Form data - simplified for new program
  newProgram = {
    // Program Master selection - now using ProgramsContentMaster
    programsContentMasterId: '',
    // Program details
    programNameL1: '', // Program name in Arabic (3-70 chars)
    programNameL2: '', // Program name in English (optional)
    programDescription: '' // Program description (optional)
  };

  get total(): number { return this.filteredCourses.length; }
  get totalPages(): number { return Math.max(1, Math.ceil(this.total / this.pageSize)); }

  get filteredCourses() {
    let list = [...this.courses];
    if (this.selectedCategory !== 'جميع الدورات') {
      list = list.filter(c => (c.category || '').includes(this.selectedCategory));
    }
    if (this.query.trim()) {
      const q = this.query.trim();
      list = list.filter(c =>
        (c.title || '').toLowerCase().includes(q.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(q.toLowerCase())
      );
    }
    return list;
  }

  get pagedCourses() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredCourses.slice(start, start + this.pageSize);
  }

  constructor(private api: ApiService, private router: Router, private route: ActivatedRoute, private auth: AuthService) {
    this.isAdmin$ = this.auth.roles$.pipe(
      map(roles => {
        const roleArray = roles || [];
        return roleArray.some(r => r.toLowerCase().includes('admin')) || 
               roleArray.some(r => r.toLowerCase().includes('administrator')) || 
               roleArray.some(r => r.toLowerCase().includes('superadmin'));
      })
    );
  }

  ngOnInit(): void {
    // Use development token for testing if available
    this.auth.useDevToken();
    
    this.route.queryParams.subscribe(params => {
      this.query = params.q || params.search || '';
      this.debouncedQuery = this.query;
      if (params.category) {
        // Map category from English to Arabic
        const categoryMap: { [key: string]: string } = {
          'tech': 'التكنولوجيا',
          'business': 'الأعمال',
          'design': 'التصميم',
          'language': 'اللغات',
          'skills': 'تطوير الذات'
        };
        this.selectedCategory = categoryMap[params.category] || 'جميع الدورات';
      }
    });
    // Load datasets for Catalog-style view
    this.loadCatalogData();
    // Keep legacy courses loader for backward compatibility
    this.fetchCourses();
    this.loadReferenceData();
    
    // اختبار الاتصال بالـ API
    this.testApiConnection();
  }

  testApiConnection(): void {
    console.log('Testing API connection...');
    console.log('Environment API Base URL:', environment.apiBaseUrl);
    
    // اختبار بسيط للـ API - لا نعرض خطأ للمستخدم إذا فشل
    this.api.getAcademyClaseMaster().subscribe({
      next: (data) => {
        console.log('✅ API Connection successful:', data);
      },
      error: (err) => {
        console.error('❌ API Connection failed:', err);
        // Don't set error for connection test, just log it
        console.warn('API connection test failed - continuing anyway');
        // Check if it's an authentication error
        if (err.status === 401) {
          console.warn('Authentication required - user may need to login to access courses');
        } else if (err.status === 0) {
          console.warn('Network error - possible CORS issue or server unavailable');
        }
      }
    });
  }

  onSearch(): void {
    const q = (this.query || '').trim();
    // Update current route's query params so the URL is shareable and stateful
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: q || null }, // null removes the param when empty
      queryParamsHandling: 'merge'
    });
    this.page = 1;
    // simple debounce mimic for filtering
    setTimeout(() => { this.debouncedQuery = q; }, 250);
  }

  // Load datasets matching React CatalogPage (Projects Master/Detail and Programs)
  private loadCatalogData(): void {
    // Projects Master
    this.api.getProjectsMaster().subscribe({
      next: (res) => {
        const data = Array.isArray(res) ? res : (res?.items || res?.data || []);
        this.projectMasters = data && data.length ? data : this.defaultProjectMasters;
      },
      error: () => { this.projectMasters = this.defaultProjectMasters; }
    });
    // Projects Detail
    this.api.getProjectsDetail().subscribe({
      next: (res) => {
        const data = Array.isArray(res) ? res : (res?.items || res?.data || []);
        this.projectDetails = data && data.length ? data : this.defaultProjectDetails;
      },
      error: () => { this.projectDetails = this.defaultProjectDetails; }
    });
    // Programs (ProgramsContentMaster)
    this.api.getProgramsContentMaster().subscribe({
      next: (res) => {
        const data = Array.isArray(res) ? res : (res?.items || res?.data || []);
        this.programDetails = data && data.length ? data : this.defaultPrograms;
      },
      error: () => { this.programDetails = this.defaultPrograms; }
    });
  }

  // Catalog-style filtering helpers
  private includesQuery(value: any, q: string): boolean {
    if (!value) return false;
    try { return String(value).toLowerCase().includes(q); } catch { return false; }
  }

  get filteredProjectMasters(): any[] {
    const q = (this.debouncedQuery || '').toLowerCase();
    if (!q) return this.projectMasters;
    return (this.projectMasters || []).filter(pm => {
      const values = [pm.ProjectNameL1, pm.projectNameL1, pm.ProjectNameL2, pm.projectNameL2, pm.Description, pm.description, pm.id, pm.Id].filter(Boolean);
      return values.some(v => this.includesQuery(v, q));
    });
  }

  get filteredProjectDetails(): any[] {
    const q = (this.debouncedQuery || '').toLowerCase();
    if (!q) return this.projectDetails;
    return (this.projectDetails || []).filter(pd => {
      const values = [pd.ProjectNameL1, pd.projectNameL1, pd.ProjectNameL2, pd.projectNameL2, pd.Description, pd.description, pd.ProjectsMasterId, pd.projectsMasterId, pd.id, pd.Id].filter(Boolean);
      return values.some(v => this.includesQuery(v, q));
    });
  }

  get filteredProgramDetails(): any[] {
    const q = (this.debouncedQuery || '').toLowerCase();
    if (!q) return this.programDetails;
    return (this.programDetails || []).filter(pr => {
      const values = [pr.SessionNameL1, pr.sessionNameL1, pr.SessionNameL2, pr.sessionNameL2, pr.Description, pr.description, pr.SessionNo?.toString?.(), pr.id, pr.Id].filter(Boolean);
      return values.some(v => this.includesQuery(v, q));
    });
  }

  get pmCount(): number { return this.filteredProjectMasters.length; }
  get pdCount(): number { return this.filteredProjectDetails.length; }
  get prCount(): number { return this.filteredProgramDetails.length; }

  loadReferenceData(): void {
    console.log('Loading reference data...');
    
    // Load ProgramsContentMaster - with error handling to prevent blocking
    this.api.getProgramsContentMaster().subscribe({
      next: (data) => {
        console.log('ProgramsContentMaster API response:', data);
        this.programsContentMaster = Array.isArray(data) ? data : (data?.items || data?.data || []);
        console.log('ProgramsContentMaster loaded:', this.programsContentMaster.length, this.programsContentMaster);
      },
      error: (err) => {
        console.error('Error loading ProgramsContentMaster:', err);
        // Don't set error for reference data, just log it
        console.warn('ProgramsContentMaster data not available - continuing without it');
        // Set empty array to prevent undefined errors
        this.programsContentMaster = [];
      }
    });
    
    // Load academies - with error handling to prevent blocking
    this.api.getAcademyData().subscribe({
      next: (data) => {
        console.log('Academies API response:', data);
        this.academies = Array.isArray(data) ? data : (data?.items || data?.data || []);
        console.log('Academies loaded:', this.academies.length, this.academies);
      },
      error: (err) => {
        console.error('Error loading academies:', err);
        // Don't set error for reference data, just log it
        console.warn('Academies data not available - continuing without it');
        // Set empty array to prevent undefined errors
        this.academies = [];
      }
    });

    // Load branches - with error handling to prevent blocking
    this.api.getBranchesData().subscribe({
      next: (data) => {
        console.log('Branches API response:', data);
        this.branches = Array.isArray(data) ? data : (data?.items || data?.data || []);
        console.log('Branches loaded:', this.branches.length, this.branches);
      },
      error: (err) => {
        console.error('Error loading branches:', err);
        // Don't set error for reference data, just log it
        console.warn('Branches data not available - continuing without it');
        // Set empty array to prevent undefined errors
        this.branches = [];
      }
    });

    // Load clase types - from API only
    this.api.getAcademyClaseType().subscribe({
      next: (data) => {
        console.log('Clase types API response:', data);
        console.log('Raw data type:', typeof data);
        console.log('Raw data structure:', JSON.stringify(data, null, 2));
        
        // Try multiple ways to extract the data from API response
        if (Array.isArray(data)) {
          this.claseTypes = data;
        } else if (data && typeof data === 'object') {
          // Try different possible data structures
          this.claseTypes = data.items || data.data || data.result || data.claseTypes || data.types || [];
        } else {
          this.claseTypes = [];
        }
        
        console.log('Clase types loaded from API:', this.claseTypes.length, this.claseTypes);
      },
      error: (err) => {
        console.error('Error loading clase types from API:', err);
        console.warn('Clase types data not available from API');
        
        // Set empty array when API fails - no default types
        this.claseTypes = [];
        console.log('No clase types available - API failed');
      }
    });
  }

  fetchCourses(): void {
    this.loading = true;
    this.error = null;
    
    // First, get ProgramsContentMaster to get the session titles
    this.api.getProgramsContentMaster().subscribe({
      next: (masterData) => {
        console.log('ProgramsContentMaster API response:', masterData);
        const masterArr = Array.isArray(masterData) ? masterData : (masterData?.items || masterData?.data || masterData?.result || []);
        
        // Create a map of masterId to session data for quick lookup
        const masterMap = new Map();
        masterArr.forEach((master: any) => {
          const masterId = master.id || master.Id || master.masterId || master.uid;
          if (masterId) {
            const sessionData = {
              sessionNameL1: master.sessionNameL1 || master.SessionNameL1 || '',
              sessionNameL2: master.sessionNameL2 || master.SessionNameL2 || '',
              description: master.description || master.Description || '',
              sessionNo: master.sessionNo || master.SessionNo || 0
            };
            masterMap.set(masterId, sessionData);
            console.log(`Mapped master ${masterId}:`, sessionData);
          }
        });
        console.log(`Total master records mapped: ${masterMap.size}`);

        // Now get ProgramsContentDetail and map with master data
        this.api.getProgramsContentDetail().subscribe({
          next: (detailData) => {
            console.log('ProgramsContentDetail API response:', detailData);
            const detailArr = Array.isArray(detailData) ? detailData : (detailData?.items || detailData?.data || detailData?.result || []);
            
            let mapped = detailArr.map((item: any) => {
              // Try different possible field names for the master ID
              const masterId = item.programsContentMasterId || item.ProgramsContentMasterId || 
                              item.programsContentMaster || item.ProgramsContentMaster ||
                              item.masterId || item.MasterId;
              const masterInfo = masterId ? masterMap.get(masterId) : null;
              
              console.log(`Detail item ${item.id}:`, {
                masterId: masterId,
                hasMasterInfo: !!masterInfo,
                masterInfo: masterInfo,
                allFields: Object.keys(item),
                originalItem: item
              });
              
              // Create title without session number
              let title = masterInfo?.sessionNameL1 || item.title || item.sessionNameL1 || item.SessionNameL1 || 'محتوى بدون عنوان';
              
              return {
                id: item.id || item.Id || item.detailId || item.uid,
                title: title,
                description: masterInfo?.description || item.description || item.Description || '',
                durationWeeks: 0,
                students: 0,
                price: 0,
                rating: 0,
                level: 'غير محدد',
                category: 'محتوى',
                imageUrl: item.imageUrl || item.ImageUrl || null,
                academyId: item.academyDataId || item.AcademyDataId || item.academyId || item.AcademyId || null,
                branchId: item.branchCodeId || item.BranchCodeId || item.branchId || item.BranchId || null,
                // ProgramsContentDetail specific fields
                programsContentMasterId: masterId,
                programNameL2: masterInfo?.sessionNameL2 || item.programNameL2 || item.ProgramNameL2 || '',
                sessionNo: masterInfo?.sessionNo || 0
              };
            });

            // Scope for students: only their academy/branch (only if authenticated)
            if (this.auth.isStudent() && !this.auth.isAdmin()) {
              const aId = this.auth.getAcademyId();
              const bId = this.auth.getBranchId();
              if (aId || bId) {
                mapped = mapped.filter((x: any) => {
                  const matchA = aId ? String(x.academyId || '').toLowerCase() === String(aId).toLowerCase() : true;
                  const matchB = bId ? String(x.branchId || '').toLowerCase() === String(bId).toLowerCase() : true;
                  return matchA && matchB;
                });
              }
            }
            
            // If no courses were mapped with titles, try to use ProgramsContentMaster directly
            if (mapped.length > 0 && mapped.every((c: any) => c.title === 'محتوى بدون عنوان')) {
              console.log('No titles found in detail mapping, using ProgramsContentMaster directly');
              const masterMapped = masterArr.map((master: any) => ({
                id: master.id || master.Id || master.masterId || master.uid,
                title: master.sessionNameL1 || master.SessionNameL1 || 'جلسة بدون عنوان',
                description: master.description || master.Description || '',
                durationWeeks: 0,
                students: 0,
                price: 0,
                rating: 0,
                level: 'غير محدد',
                category: 'جلسات',
                imageUrl: null,
                academyId: master.academyDataId || master.AcademyDataId || null,
                branchId: master.branchCodeId || master.BranchCodeId || null,
                programsContentMasterId: master.id || master.Id || master.masterId || master.uid,
                programNameL2: master.sessionNameL2 || master.SessionNameL2 || '',
                sessionNo: master.sessionNo || master.SessionNo || 0
              }));
              this.courses = masterMapped;
            } else {
              this.courses = mapped;
            }
            
            console.log(`Final courses mapped: ${this.courses.length}`, this.courses);
            this.loading = false;
            this.page = 1;
          },
          error: (detailErr) => {
            console.error('getProgramsContentDetail error', detailErr);
            this.error = 'فشل في تحميل تفاصيل الدورات';
            this.loading = false;
            
            // Fallback to other APIs
            this.tryFallbackCourses();
          }
        });
      },
      error: (masterErr) => {
        console.error('getProgramsContentMaster error', masterErr);
        // If master API fails, try fallback
        this.tryFallbackCourses();
      }
    });
  }

  private tryFallbackCourses(): void {
    console.log('Trying fallback methods to get courses...');
    
    // Try ProgramsContentMaster first
    this.api.getProgramsContentMaster().subscribe({
      next: (pcm) => {
        console.log('Fallback: ProgramsContentMaster success');
        const arr1 = Array.isArray(pcm) ? pcm : (pcm?.items || pcm?.data || pcm?.result || []);
        let arr1mapped = arr1.map((x: any) => ({
          id: x.id || x.contentId || x.masterId || x.uid,
          title: x.sessionNameL1 || x.title || 'جلسة بدون عنوان',
          description: x.description || '',
          durationWeeks: 0,
          students: 0,
          price: 0,
          rating: 0,
          level: 'غير محدد',
          category: 'جلسات',
          imageUrl: x.imageUrl || null,
          academyId: x.academyDataId || x.AcademyDataId || x.academyId || x.AcademyId || null,
          branchId: x.branchCodeId || x.BranchCodeId || x.branchId || x.BranchId || null,
        }));
        
        // Apply authentication filtering if needed
        if (this.auth.isStudent() && !this.auth.isAdmin()) {
          const aId = this.auth.getAcademyId();
          const bId = this.auth.getBranchId();
          if (aId || bId) {
            arr1mapped = arr1mapped.filter((x: any) => {
              const matchA = aId ? String(x.academyId || '').toLowerCase() === String(aId).toLowerCase() : true;
              const matchB = bId ? String(x.branchId || '').toLowerCase() === String(bId).toLowerCase() : true;
              return matchA && matchB;
            });
          }
        }
        
        this.courses = arr1mapped;
        this.loading = false;
        this.page = 1;
      },
      error: (e1) => {
        console.warn('Fallback 1 failed, trying fallback 2');
        // Try ProgramsContentDetail as final fallback
        this.api.getProgramsContentDetail().subscribe({
          next: (pcd) => {
            console.log('Fallback: ProgramsContentDetail success');
            const arr2 = Array.isArray(pcd) ? pcd : (pcd?.items || pcd?.data || pcd?.result || []);
            let arr2mapped = arr2.map((x: any) => ({
              id: x.id || x.detailId || x.uid,
              title: x.title || x.sessionNameL1 || 'محتوى بدون عنوان',
              description: x.description || '',
              durationWeeks: 0,
              students: 0,
              price: 0,
              rating: 0,
              level: 'غير محدد',
              category: 'محتوى',
              imageUrl: x.imageUrl || null,
              academyId: x.academyDataId || x.AcademyDataId || x.academyId || x.AcademyId || null,
              branchId: x.branchCodeId || x.BranchCodeId || x.branchId || x.BranchId || null,
            }));
            
            // Apply authentication filtering if needed
            if (this.auth.isStudent() && !this.auth.isAdmin()) {
              const aId = this.auth.getAcademyId();
              const bId = this.auth.getBranchId();
              if (aId || bId) {
                arr2mapped = arr2mapped.filter((x: any) => {
                  const matchA = aId ? String(x.academyId || '').toLowerCase() === String(aId).toLowerCase() : true;
                  const matchB = bId ? String(x.branchId || '').toLowerCase() === String(bId).toLowerCase() : true;
                  return matchA && matchB;
                });
              }
            }
            
            this.courses = arr2mapped;
            this.loading = false;
            this.page = 1;
          },
          error: (e2) => {
            console.error('All fallback methods failed');
            this.courses = []; // Empty courses array
            // Show a more user-friendly message instead of error
            this.error = 'لا توجد دورات متاحة حالياً. يرجى المحاولة لاحقاً أو تسجيل الدخول لعرض الدورات المتاحة.';
            console.log('All API endpoints failed - showing empty state');
            this.loading = false;
          }
        });
      }
    });
  }

  getCourseImage(course: any): string {
    // إذا كان هناك رابط صورة مباشر، استخدمه
    if (course?.imageUrl) return course.imageUrl;
    
    // إذا كان هناك معرف للدورة، حاول جلب الصورة من API
    const id = course?.id || course?.Id;
    if (id) {
      return `${environment.apiBaseUrl}/api/ProgramsContentDetail/${id}/image`;
    }
    
    // إذا لم يكن هناك معرف أو رابط صورة، استخدم الصورة الافتراضية
    return 'assets/images/course_placeholder-DE1r9TwW.png';
  }

  getAcademyName(academyId: string): string {
    if (!academyId || !this.academies || this.academies.length === 0) {
      return 'أكاديمية غير معروفة';
    }
    
    const academy = this.academies.find(a => 
      a.id === academyId || 
      a.Id === academyId || 
      String(a.id) === String(academyId) || 
      String(a.Id) === String(academyId)
    );
    
    if (academy) {
      return academy.claseNameL1 || academy.ClaseNameL1 || academy.academyNameL1 || academy.AcademyNameL1 || academy.name || academy.Name || 'أكاديمية غير معروفة';
    }
    
    return 'أكاديمية غير معروفة';
  }

  getBranchName(branchId: string): string {
    if (!branchId || !this.branches || this.branches.length === 0) {
      return 'فرع غير معروف';
    }
    
    const branch = this.branches.find(b => 
      b.id === branchId || 
      b.Id === branchId || 
      String(b.id) === String(branchId) || 
      String(b.Id) === String(branchId)
    );
    
    if (branch) {
      return branch.branchNameL1 || branch.BranchNameL1 || branch.name || branch.Name || 'فرع غير معروف';
    }
    
    return 'فرع غير معروف';
  }

  getClaseTypeName(typeId: string): string {
    if (!typeId || !this.claseTypes || this.claseTypes.length === 0) {
      return 'نوع غير معروف';
    }
    
    const type = this.claseTypes.find(t => 
      t.id === typeId || 
      t.Id === typeId || 
      String(t.id) === String(typeId) || 
      String(t.Id) === String(typeId)
    );
    
    if (type) {
      return type.classTypeNameId || type.ClassTypeNameId || type.name || type.Name || 'نوع غير معروف';
    }
    
    return 'نوع غير معروف';
  }

  getProgramsContentMasterName(masterId: string): string {
    if (!masterId || !this.programsContentMaster || this.programsContentMaster.length === 0) {
      return 'برنامج غير معروف';
    }
    
    const master = this.programsContentMaster.find(m => 
      m.id === masterId || 
      m.Id === masterId || 
      String(m.id) === String(masterId) || 
      String(m.Id) === String(masterId)
    );
    
    if (master) {
      return master.sessionNameL1 || master.SessionNameL1 || master.title || master.Title || 'برنامج غير معروف';
    }
    
    return 'برنامج غير معروف';
  }


  nextPage() {
    if (this.page < this.totalPages) this.page += 1;
  }

  prevPage() {
    if (this.page > 1) this.page -= 1;
  }

  // Admin functions
  showAddCourseForm() {
    this.showAddForm = true;
    this.showEditForm = false;
    this.resetForm();
    // إعادة تحميل البيانات المرجعية عند فتح النموذج
    this.loadReferenceData();
  }

  showEditCourseForm(course: any) {
    this.editingCourse = course;
    this.showEditForm = true;
    this.showAddForm = false;
    // إعادة تحميل البيانات المرجعية عند فتح النموذج
    this.loadReferenceData();
    this.newProgram = {
      programsContentMasterId: course.programsContentMasterId || course.academyClaseMasterId || '',
      programNameL1: course.title || '',
      programNameL2: course.programNameL2 || '',
      programDescription: course.description || ''
    };
    
    console.log('Editing course:', course);
    console.log('Form data prepared:', this.newProgram);
  }

  resetForm() {
    this.newProgram = {
      programsContentMasterId: '',
      programNameL1: '',
      programNameL2: '',
      programDescription: ''
    };
  }


  onClaseTypeChange(event: any) {
    const selectedValue = event.target.value;
    console.log('Clase type changed to:', selectedValue);
    console.log('Available clase types:', this.claseTypes);
    
    if (selectedValue) {
      const selectedType = this.claseTypes.find(t => 
        String(t.id) === String(selectedValue) || String(t.Id) === String(selectedValue)
      );
      console.log('Selected type:', selectedType);
    }
  }

  addProgram() {
    // تسجيل البيانات للتشخيص
    console.log('Form data before validation:', {
      programNameL1: this.newProgram.programNameL1,
      programNameL2: this.newProgram.programNameL2,
      programDescription: this.newProgram.programDescription,
      programsContentMasterId: this.newProgram.programsContentMasterId,
      programsContentMaster: this.programsContentMaster.length
    });

    // التحقق من صحة البيانات المدخلة
    if (!this.newProgram.programNameL1.trim()) {
      this.error = 'يرجى إدخال اسم البرنامج بالعربية';
      return;
    }

    if (this.newProgram.programNameL1.trim().length < 3 || this.newProgram.programNameL1.trim().length > 70) {
      this.error = 'اسم البرنامج بالعربية يجب أن يكون بين 3 و 70 حرف';
      return;
    }

    if (!this.newProgram.programsContentMasterId || this.newProgram.programsContentMasterId.trim() === '') {
      this.error = 'يرجى اختيار البرنامج الرئيسي';
      return;
    }

    // التحقق من وجود البيانات المرجعية
    if (this.programsContentMaster.length === 0) {
      this.error = 'لا توجد برامج رئيسية متاحة. يرجى المحاولة لاحقاً.';
      return;
    }

    this.loading = true;
    this.error = null;

    // إنشاء ProgramsContentDetail حسب API
    const formData = new FormData();
    
    // الحقول المطلوبة حسب API - AcademyClaseMaster
    formData.append('ClaseNameL1', this.newProgram.programNameL1.trim());
    
    // الحقول الاختيارية
    if (this.newProgram.programNameL2.trim()) {
      formData.append('ClaseNameL2', this.newProgram.programNameL2.trim());
    }
    if (this.newProgram.programDescription.trim()) {
      formData.append('Description', this.newProgram.programDescription.trim());
    }

    // الحقول المطلوبة الأخرى حسب API
    formData.append('ProgramsContentMasterId', this.newProgram.programsContentMasterId);
    formData.append('ClaseAddress', 'عنوان افتراضي'); // مطلوب حسب API
    formData.append('Location', 'موقع افتراضي'); // مطلوب حسب API
    formData.append('ClaseOwnerName', 'مالك افتراضي'); // مطلوب حسب API
    formData.append('OwnerMobil', '1234567890'); // مطلوب حسب API
    formData.append('CommunicationsOfficer', 'مسؤول افتراضي'); // مطلوب حسب API
    formData.append('CommunicationsMobil', '1234567890'); // مطلوب حسب API
    formData.append('EmailClase', 'default@example.com'); // مطلوب حسب API
    formData.append('EmailOwner', 'owner@example.com'); // مطلوب حسب API

    console.log('Creating ProgramsContentDetail with data:', {
      programNameL1: this.newProgram.programNameL1,
      programNameL2: this.newProgram.programNameL2,
      programDescription: this.newProgram.programDescription,
      programsContentMasterId: this.newProgram.programsContentMasterId
    });

    this.api.createProgramsContentDetail(formData).subscribe({
      next: (response) => {
        console.log('ProgramsContentDetail created successfully:', response);
        this.showAddForm = false;
        this.resetForm();
        this.fetchCourses();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error adding program (ProgramsContentDetail):', err);
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error
        });
        
        // إذا لم يكن مسار الـ Detail متاحًا (404)، استخدم منطق الصفحة العاملة في React: أنشئ في ProgramsContentMaster
        if (err.status === 404) {
          console.warn('Detail endpoint returned 404. Falling back to ProgramsContentMaster create...');
          const masterPayload: any = {
            SessionNameL1: this.newProgram.programNameL1.trim(),
            SessionNameL2: this.newProgram.programNameL2.trim() || undefined,
            Description: this.newProgram.programDescription.trim() || undefined
          };
          this.api.createProgramsContentMaster(masterPayload).subscribe({
            next: (res) => {
              console.log('ProgramsContentMaster created successfully (fallback):', res);
              this.showAddForm = false;
              this.resetForm();
              this.fetchCourses();
              this.loading = false;
            },
            error: (err2) => {
              console.error('Fallback create (ProgramsContentMaster) failed:', err2);
              // رسائل خطأ أكثر تفصيلاً
              if (err2.status === 400) {
                this.error = 'بيانات البرنامج غير صحيحة. يرجى التحقق من جميع الحقول المطلوبة.';
              } else if (err2.status === 401) {
                this.error = 'غير مخول لإضافة برامج. يرجى تسجيل الدخول كمدير.';
              } else if (err2.status === 403) {
                this.error = 'ليس لديك صلاحية لإضافة برامج.';
              } else if (err2.status === 500) {
                this.error = 'خطأ في الخادم. يرجى المحاولة لاحقاً.';
              } else {
                this.error = `حدث خطأ أثناء إضافة البرنامج: ${err2.statusText || 'خطأ غير معروف'}`;
              }
              this.loading = false;
            }
          });
          return;
        }

        // رسائل خطأ أكثر تفصيلاً للمسار الأصلي
        if (err.status === 400) {
          this.error = 'بيانات البرنامج غير صحيحة. يرجى التحقق من جميع الحقول المطلوبة.';
        } else if (err.status === 401) {
          this.error = 'غير مخول لإضافة برامج. يرجى تسجيل الدخول كمدير.';
        } else if (err.status === 403) {
          this.error = 'ليس لديك صلاحية لإضافة برامج.';
        } else if (err.status === 500) {
          this.error = 'خطأ في الخادم. يرجى المحاولة لاحقاً.';
        } else {
          this.error = `حدث خطأ أثناء إضافة البرنامج: ${err.statusText || 'خطأ غير معروف'}`;
        }
        this.loading = false;
      }
    });
  }

  updateProgram() {
    // التحقق من صحة البيانات المدخلة مثل صفحة React
    if (!this.newProgram.programNameL1.trim()) {
      this.error = 'يرجى إدخال اسم البرنامج بالعربية';
      return;
    }

    if (this.newProgram.programNameL1.trim().length < 3 || this.newProgram.programNameL1.trim().length > 70) {
      this.error = 'اسم البرنامج بالعربية يجب أن يكون بين 3 و 70 حرف';
      return;
    }

    if (!this.newProgram.programsContentMasterId.trim()) {
      this.error = 'يرجى اختيار البرنامج الرئيسي';
      return;
    }

    if (this.programsContentMaster.length === 0) {
      this.error = 'لا توجد برامج رئيسية متاحة. يرجى المحاولة لاحقاً.';
      return;
    }

    this.loading = true;
    this.error = null;

    // تنظيف البيانات وإرسال كائن بسيط، مع تضمين Id في التحديث لأن الخادم قد يتطلبه مع multipart
    const cleaned: any = {
      SessionNameL1: this.newProgram.programNameL1.trim()
    };
    if (this.newProgram.programNameL2 && this.newProgram.programNameL2.trim()) {
      cleaned.SessionNameL2 = this.newProgram.programNameL2.trim();
    }
    if (this.newProgram.programDescription && this.newProgram.programDescription.trim()) {
      cleaned.Description = this.newProgram.programDescription.trim();
    }

    const targetId = this.editingCourse.programsContentMasterId || this.editingCourse.id;
    cleaned.Id = targetId; // بعض الخوادم تتطلب Id داخل الجسم عند استخدام FormData

    console.log('Updating program with cleaned data (no Id in body):', {
      id: targetId,
      ...cleaned
    });

    this.api.updateProgramsContentMaster(targetId, cleaned).subscribe({
      next: (response) => {
        console.log('Program updated successfully:', response);
        this.showEditForm = false;
        this.editingCourse = null;
        this.resetForm();
        this.fetchCourses();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error updating program:', err);
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error
        });
        
        // رسائل خطأ أكثر تفصيلاً
        if (err.status === 400) {
          this.error = 'بيانات البرنامج غير صحيحة. يرجى التحقق من جميع الحقول المطلوبة.';
        } else if (err.status === 401) {
          this.error = 'غير مخول لتحديث البرامج. يرجى تسجيل الدخول كمدير.';
        } else if (err.status === 403) {
          this.error = 'ليس لديك صلاحية لتحديث البرامج.';
        } else if (err.status === 404) {
          this.error = 'البرنامج غير موجود.';
        } else if (err.status === 500) {
          this.error = 'خطأ في الخادم. يرجى المحاولة لاحقاً.';
        } else {
          this.error = `حدث خطأ أثناء تحديث البرنامج: ${err.statusText || 'خطأ غير معروف'}`;
        }
        this.loading = false;
      }
    });
  }

  deleteProgram(course: any) {
    if (!confirm('هل أنت متأكد من حذف هذا البرنامج؟')) {
      return;
    }

    this.loading = true;
    this.error = null;

    // التأكد من استخدام الـ ID الصحيح حسب API
    const programId = course.id || course.Id || course.detailId || course.uid;
    if (!programId) {
      this.error = 'معرف البرنامج غير صحيح';
      this.loading = false;
      return;
    }

    this.api.deleteProgramsContentDetail(programId).subscribe({
      next: () => {
        this.fetchCourses();
      },
      error: (err) => {
        console.error('Error deleting program (ProgramsContentDetail):', err);
        // Fallback: some backends expose deletion on ProgramsContentMaster
        if (err?.status === 404) {
          console.warn('Detail delete returned 404. Trying ProgramsContentMaster delete...');
          this.api.deleteProgramsContentMaster(programId).subscribe({
            next: () => {
              this.fetchCourses();
            },
            error: (err2) => {
              console.error('Fallback delete (ProgramsContentMaster) failed:', err2);
              this.error = 'حدث خطأ أثناء حذف البرنامج';
              this.loading = false;
            }
          });
          return;
        }
        this.error = 'حدث خطأ أثناء حذف البرنامج';
        this.loading = false;
      }
    });
  }

  cancelForm() {
    this.showAddForm = false;
    this.showEditForm = false;
    this.editingCourse = null;
    this.resetForm();
    this.error = null;
  }
}
