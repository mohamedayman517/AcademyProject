import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface ProjectDetails {
  id: string;
  title: string;
  description: string;
  projectNameL1?: string;
  projectNameL2?: string;
  projectStart?: string;
  projectEnd?: string;
  academyDataId?: string;
  branchesDataId?: string;
  projectResources?: string;
  projectFile?: string;
  projectId?: string;
  projectDescription?: string;
  branch?: string;
  status?: string;
}

@Component({
  selector: 'app-project-details-view',
  templateUrl: './project-details-view.component.html',
  styleUrls: ['./project-details-view.component.css']
})
export class ProjectDetailsViewComponent implements OnInit {
  id: string | null = null;
  project: ProjectDetails | null = null;
  loading = false;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private api: ApiService) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      // تحديد نوع البيانات بناءً على الـ route
      const currentRoute = this.route.snapshot.url.join('/');
      if (currentRoute.includes('project-details')) {
        this.fetchProjectDetail(this.id);
      } else {
        this.fetch(this.id);
      }
    }
  }

  fetch(id: string) {
    this.loading = true;
    this.error = null;
    console.log('Fetching project with ID:', id);
    
    this.api.getProjectsMasterById(id).subscribe({
      next: res => {
        console.log('Project data received:', res);
        const projectData = res?.project || res || null;
        if (projectData) {
          this.project = {
            id: projectData.id || projectData.projectId || id,
            title: projectData.projectNameL1 || projectData.title || projectData.name || 'مشروع بدون عنوان',
            description: projectData.description || projectData.projectDescription || 'لا يوجد وصف متاح',
            projectNameL1: projectData.projectNameL1,
            projectNameL2: projectData.projectNameL2,
            projectStart: projectData.projectStart,
            projectEnd: projectData.projectEnd,
            academyDataId: projectData.academyDataId,
            branchesDataId: projectData.branchesDataId,
            projectResources: projectData.projectResources,
            projectFile: projectData.projectFile,
            projectId: projectData.id || projectData.projectId,
            projectDescription: projectData.description || projectData.projectDescription,
            branch: projectData.branchNameL1 || projectData.branch || 'غير محدد',
            status: 'نشط'
          };
        } else {
          this.error = 'لم يتم العثور على بيانات المشروع';
        }
        this.loading = false;
      },
      error: err => {
        console.error('Error fetching project:', err);
        this.error = `حدث خطأ في تحميل المشروع: ${err?.status === 404 ? 'المشروع غير موجود' : err?.message || 'خطأ غير متوقع'}`;
        this.loading = false;
        
        // Set default project data for demonstration only if it's a 404 error
        if (err?.status === 404) {
          this.project = {
            id: id,
            title: 'مشروع غير موجود',
            description: 'المشروع المطلوب غير موجود في قاعدة البيانات',
            projectNameL1: 'مشروع غير موجود',
            projectNameL2: 'Project Not Found',
            projectStart: '',
            projectEnd: '',
            branch: 'غير محدد',
            status: 'غير متاح'
          };
        }
      }
    });
  }

  fetchProjectDetail(id: string) {
    this.loading = true;
    this.error = null;
    console.log('Fetching project detail with ID:', id);
    
    this.api.getProjectsDetailById(id).subscribe({
      next: res => {
        console.log('Project detail data received:', res);
        const projectData = res?.project || res || null;
        if (projectData) {
          this.project = {
            id: projectData.id || projectData.projectId || id,
            title: projectData.projectNameL1 || projectData.title || projectData.name || 'تفاصيل مشروع بدون عنوان',
            description: projectData.description || projectData.projectDescription || 'لا يوجد وصف متاح',
            projectNameL1: projectData.projectNameL1,
            projectNameL2: projectData.projectNameL2,
            projectStart: projectData.projectStart,
            projectEnd: projectData.projectEnd,
            academyDataId: projectData.academyDataId,
            branchesDataId: projectData.branchesDataId,
            projectResources: projectData.projectResources,
            projectFile: projectData.projectFile,
            projectId: projectData.id || projectData.projectId,
            projectDescription: projectData.description || projectData.projectDescription,
            branch: projectData.branchNameL1 || projectData.branch || 'غير محدد',
            status: 'نشط'
          };
        } else {
          this.error = 'لم يتم العثور على تفاصيل المشروع';
        }
        this.loading = false;
      },
      error: err => {
        console.error('Error fetching project detail:', err);
        this.error = `حدث خطأ في تحميل تفاصيل المشروع: ${err?.status === 404 ? 'تفاصيل المشروع غير موجودة' : err?.message || 'خطأ غير متوقع'}`;
        this.loading = false;
        
        // Set default project data for demonstration only if it's a 404 error
        if (err?.status === 404) {
          this.project = {
            id: id,
            title: 'تفاصيل مشروع غير موجودة',
            description: 'تفاصيل المشروع المطلوب غير موجودة في قاعدة البيانات',
            projectNameL1: 'تفاصيل مشروع غير موجودة',
            projectNameL2: 'Project Details Not Found',
            projectStart: '',
            projectEnd: '',
            branch: 'غير محدد',
            status: 'غير متاح'
          };
        }
      }
    });
  }

  retryFetch(): void {
    if (this.id) {
      const currentRoute = this.route.snapshot.url.join('/');
      if (currentRoute.includes('project-details')) {
        this.fetchProjectDetail(this.id);
      } else {
        this.fetch(this.id);
      }
    }
  }

  goBack(): void {
    // العودة إلى الصفحة المناسبة بناءً على الـ route
    const currentRoute = this.route.snapshot.url.join('/');
    if (currentRoute.includes('project-details')) {
      this.router.navigate(['/projects-details']);
    } else {
      this.router.navigate(['/projects']);
    }
  }

  downloadProjectFile(): void {
    if (this.project?.projectFile) {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = this.project.projectFile;
      link.download = 'project-file';
      link.click();
    } else {
      alert('لا يوجد ملف مشروع متاح للتحميل');
    }
  }

  downloadResources(): void {
    if (this.project?.projectResources) {
      // Create a temporary link to download the resources
      const link = document.createElement('a');
      link.href = this.project.projectResources;
      link.download = 'project-resources';
      link.click();
    } else {
      alert('لا توجد موارد متاحة للتحميل');
    }
  }

  getDuration(): string {
    if (this.project?.projectStart && this.project?.projectEnd) {
      const start = new Date(this.project.projectStart);
      const end = new Date(this.project.projectEnd);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} يوم`;
    }
    return 'غير محدد';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
