import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-branches',
  templateUrl: './branches.component.html',
  styleUrls: ['./branches.component.css']
})
export class BranchesComponent implements OnInit {
  loading = false;
  error: string | null = null;
  branches: any[] = [];
  clases: any[] = [];
  
  // Admin properties
  isAdmin = false;
  showForm = false;
  editingBranch: any = null;
  isSubmitting = false;
  
  // Form data
  newBranch: any = {
    Id: '',
    AcademyDataId: '',
    BranchNameL1: '',
    BranchNameL2: '',
    BranchAddress: '',
    BranchMobile: '',
    BranchPhone: '',
    BranchWhatsapp: '',
    BranchEmail: ''
  };

  // Dropdown data
  academies: any[] = [];

  constructor(
    private api: ApiService, 
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Use development token for testing if available
    this.auth.useDevToken();
    
    this.checkAdminStatus();
    this.fetchBranches();
    this.fetchClases();
    this.fetchAcademies();
  }

  private checkAdminStatus(): void {
    this.isAdmin = this.auth.isAdmin();
    
    // Subscribe to role changes
    this.auth.roles$.subscribe(roles => {
      this.isAdmin = this.auth.isAdmin();
      this.cdr.detectChanges();
    });
    
    // Subscribe to authentication changes
    this.auth.isAuthenticated$.subscribe(isAuth => {
      this.cdr.detectChanges();
    });
  }

  fetchBranches(): void {
    this.loading = true;
    this.error = null;
    const academyId = (environment.academyId || '').trim();
    if (!academyId) {
      this.loading = false;
      this.error = 'لم يتم إعداد معرف الأكاديمية. يرجى ضبط environment.academyId ثم إعادة المحاولة.';
      console.error('Branches requires environment.academyId');
      return;
    }

    this.api.getBranchesDataByAcademy(academyId).subscribe({
      next: (data) => {
        console.log('branches raw response (by academy)', data);
        const arr = Array.isArray(data) ? data : (data?.items || data?.data || data?.result || []);
        let mapped = arr.map((b: any) => ({
          id: b.id || b.branchId || b.uid,
          name: (b.name || b.branchName || b.BranchNameL1 || b.branchNameL1 || b.title || b.Title || '').toString().trim() || 'فرع بدون اسم',
          nameL2: b.BranchNameL2 || b.branchNameL2 || '',
          address: b.address || b.location || b.BranchAddress || '',
          mobile: b.BranchMobile || b.branchMobile || b.mobile || '',
          phone: b.BranchPhone || b.branchPhone || b.phone || '',
          whatsapp: b.BranchWhatsapp || b.branchWhatsapp || b.whatsapp || '',
          email: b.BranchEmail || b.branchEmail || b.email || '',
          city: b.city || b.cityName || '',
          governorate: b.governorate || b.governorateName || '',
          country: b.country || b.countryName || '',
          manager: b.BranchManager || b.branchManager || b.manager || '',
          imageUrl: b.imageUrl || null,
        }));
        // Fallback: if academy returns empty, try fetching all branches
        if (!mapped.length) {
          console.warn('No branches for academyId:', academyId, '— falling back to all branches');
          this.api.getBranchesData().subscribe({
            next: (all) => {
              console.log('branches raw response (all)', all);
              const allArr = Array.isArray(all) ? all : (all?.items || all?.data || all?.result || []);
              this.branches = allArr.map((b: any) => ({
                id: b.id || b.branchId || b.uid,
                name: (b.name || b.branchName || b.BranchNameL1 || b.branchNameL1 || b.title || b.Title || '').toString().trim() || 'فرع بدون اسم',
                address: b.address || b.location || '',
                phone: b.phone || b.mobile || '',
                city: b.city || b.cityName || '',
                governorate: b.governorate || b.governorateName || '',
                imageUrl: b.imageUrl || null,
              }));
            },
            error: (err) => {
              console.error('getBranches (all) error', err);
            },
            complete: () => {
              this.loading = false;
            }
          });
          return;
        }
        this.branches = mapped;
      },
      error: (err) => {
        console.error('getBranches (by academy) error', err);
        // Fallback for 404/missing route: fetch all branches
        if (err?.status === 404) {
          console.warn('Endpoint /api/BranchData/by-academy/{id} not found. Falling back to /api/BranchData');
          this.api.getBranchesData().subscribe({
            next: (all) => {
              console.log('branches raw response (all via error fallback)', all);
              const allArr = Array.isArray(all) ? all : (all?.items || all?.data || all?.result || []);
              this.branches = allArr.map((b: any) => ({
                id: b.id || b.branchId || b.uid,
                name: (b.name || b.branchName || b.BranchNameL1 || b.branchNameL1 || b.title || b.Title || '').toString().trim() || 'فرع بدون اسم',
                address: b.address || b.location || '',
                phone: b.phone || b.mobile || '',
                city: b.city || b.cityName || '',
                governorate: b.governorate || b.governorateName || '',
                imageUrl: b.imageUrl || null,
              }));
            },
            error: (e2) => {
              this.error = 'تعذر جلب الفروع. الرجاء المحاولة لاحقاً.';
              console.error('getBranches (all) error', e2);
            },
            complete: () => { this.loading = false; }
          });
          return;
        }
        this.error = 'تعذر جلب الفروع. الرجاء المحاولة لاحقاً.';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  fetchClases(): void {
    const academyId = (environment.academyId || '').trim();
    if (!academyId) {
      console.warn('fetchClases skipped: missing environment.academyId');
      return;
    }
    this.loading = true;
    this.error = null;
    this.api.getAcademyClaseMaster().subscribe({
      next: (data) => {
        console.log('clase master raw', data);
        const arr = Array.isArray(data) ? data : (data?.items || data?.data || data?.result || []);
        const source = Array.isArray(arr) ? arr : [];
        let normalized = source.filter((m: any) => {
          const aid = m.AcademyDataId || m.academyDataId || m.academyId;
          return academyId ? aid === academyId : true;
        }).map((m: any) => ({
          id: m.id || m.Id || m.uid,
          title: m.ClaseNameL1 || m.claseNameL1 || m.ClaseNameL2 || m.claseNameL2 || 'قاعة بدون اسم',
          address: m.ClaseAddress || m.claseAddress || '',
          location: m.Location || m.location || '',
          ownerMobil: m.OwnerMobil || m.ownerMobil || '',
          email: m.EmailClase || m.emailClase || '',
          branchId: m.BranchesDataId || m.branchesDataId || null,
        }));
        // If nothing matched academyId, show unfiltered list to aid debugging/visibility
        if (!normalized.length && source.length) {
          console.warn('No clases matched academyId. Showing unfiltered clases list.');
          normalized = source.map((m: any) => ({
            id: m.id || m.Id || m.uid,
            title: m.ClaseNameL1 || m.claseNameL1 || m.ClaseNameL2 || m.claseNameL2 || 'قاعة بدون اسم',
            address: m.ClaseAddress || m.claseAddress || '',
            location: m.Location || m.location || '',
            ownerMobil: m.OwnerMobil || m.ownerMobil || '',
            email: m.EmailClase || m.emailClase || '',
            branchId: m.BranchesDataId || m.branchesDataId || null,
          }));
        }
        this.clases = normalized;
      },
      error: (err) => {
        console.error('getAcademyClaseMaster error', err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  fetchAcademies(): void {
    this.api.getAcademyData().subscribe({
      next: (data) => {
        const arr = Array.isArray(data) ? data : (data?.items || data?.data || data?.result || []);
        this.academies = arr.map((a: any) => ({
          id: a.id || a.Id || a.uid,
          name: a.AcademyNameL1 || a.academyNameL1 || a.name || 'أكاديمية بدون اسم'
        }));
      },
      error: (err) => {
        console.error('getAcademyData error', err);
      }
    });
  }


  // Get Academy ID from token
  private getAcademyIdFromToken(): string {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.AcademyDataId || payload.academyDataId || payload.AcademyId || payload.academyId || '';
      }
    } catch (error) {
      // Failed to parse token for Academy ID
    }
    return '';
  }

  // Open add form
  addBranch(): void {
    this.editingBranch = null;
    this.newBranch = {
      Id: '',
      AcademyDataId: this.getAcademyIdFromToken() || environment.academyId || '',
      BranchNameL1: '',
      BranchNameL2: '',
      BranchAddress: '',
      BranchMobile: '',
      BranchPhone: '',
      BranchWhatsapp: '',
      BranchEmail: ''
    };
    this.showForm = true;
    this.cdr.detectChanges();
  }

  // Open edit form
  editBranch(branch: any): void {
    this.editingBranch = branch;
    this.newBranch = {
      Id: branch.id,
      AcademyDataId: this.getAcademyIdFromToken() || environment.academyId || '',
      BranchNameL1: branch.name || '',
      BranchNameL2: branch.nameL2 || '',
      BranchAddress: branch.address || '',
      BranchMobile: branch.mobile || '',
      BranchPhone: branch.phone || '',
      BranchWhatsapp: branch.whatsapp || '',
      BranchEmail: branch.email || ''
    };
    
    this.showForm = true;
    this.cdr.detectChanges();
  }

  // Save branch (create or update)
  saveBranch(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;
    
    // Clean data
    const cleanedData = { ...this.newBranch };
    
    // Add Academy ID from token if not set
    const academyId = this.getAcademyIdFromToken();
    if (academyId) {
      cleanedData.AcademyDataId = academyId;
    }
    
    // Remove empty string fields
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] === '' || cleanedData[key] === undefined) {
        if (key !== 'AcademyDataId' && key !== 'Id') {
          delete cleanedData[key];
        }
      }
    });

    // For updates, keep the ID
    if (this.editingBranch) {
      cleanedData.Id = this.editingBranch.id;
    } else {
      // For new branches, remove ID to let server generate it
      delete cleanedData.Id;
    }

    if (this.editingBranch) {
      // Update existing branch
      this.api.updateBranchesData(this.editingBranch.id, cleanedData).subscribe({
        next: () => {
          this.showForm = false;
          this.editingBranch = null;
          this.fetchBranches();
          this.isSubmitting = false;
        },
        error: (err) => {
          alert('فشل تحديث الفرع: ' + (err.error?.message || err.message || 'خطأ غير معروف'));
          this.isSubmitting = false;
        }
      });
    } else {
      // Create new branch
      this.api.createBranchesData(cleanedData).subscribe({
        next: () => {
          this.showForm = false;
          this.editingBranch = null;
          this.fetchBranches();
          this.isSubmitting = false;
        },
        error: (err) => {
          alert('فشل إنشاء الفرع: ' + (err.error?.message || err.message || 'خطأ غير معروف'));
          this.isSubmitting = false;
        }
      });
    }
  }

  // Validate form
  private validateForm(): boolean {
    if (!this.newBranch.BranchNameL1?.trim()) {
      alert('اسم الفرع بالعربية مطلوب');
      return false;
    }
    if (this.newBranch.BranchNameL1.trim().length < 3) {
      alert('اسم الفرع يجب أن يكون 3 أحرف على الأقل');
      return false;
    }
    if (!this.newBranch.BranchAddress?.trim()) {
      alert('عنوان الفرع مطلوب');
      return false;
    }
    if (this.newBranch.BranchAddress.trim().length < 10) {
      alert('عنوان الفرع يجب أن يكون 10 أحرف على الأقل');
      return false;
    }
    if (!this.newBranch.BranchMobile?.trim()) {
      alert('رقم الجوال مطلوب');
      return false;
    }
    if (!this.newBranch.AcademyDataId?.trim()) {
      alert('يجب اختيار الأكاديمية');
      return false;
    }
    
    // Validate email format if provided
    if (this.newBranch.BranchEmail?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.newBranch.BranchEmail.trim())) {
        alert('البريد الإلكتروني غير صحيح');
        return false;
      }
    }
    
    return true;
  }

  // Cancel form
  cancelForm(): void {
    this.showForm = false;
    this.editingBranch = null;
    this.newBranch = {
      Id: '',
      AcademyDataId: '',
      BranchNameL1: '',
      BranchNameL2: '',
      BranchAddress: '',
      BranchMobile: '',
      BranchPhone: '',
      BranchWhatsapp: '',
      BranchEmail: ''
    };
  }

  // Delete branch
  deleteBranch(branch: any): void {
    if (!confirm(`هل أنت متأكد من حذف الفرع: ${branch.name}؟`)) { 
      return; 
    }
    
    this.loading = true;
    const branchId = branch.id;
    if (!branchId) {
      alert('خطأ: لا يمكن تحديد معرف الفرع');
      this.loading = false;
      return;
    }
    
    this.api.deleteBranchesData(branchId).subscribe({
      next: () => {
        this.fetchBranches();
        this.loading = false;
      },
      error: (err) => {
        alert('فشل حذف الفرع: ' + (err.error?.message || err.message || 'خطأ غير معروف'));
        this.loading = false;
      }
    });
  }
}

