import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-careers',
  templateUrl: './careers.component.html',
  styleUrls: ['./careers.component.css']
})
export class CareersComponent implements OnInit {
  loading = false;
  error: string | null = null;
  jobs: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.fetchJobs();
  }

  private isGuid(id: string): boolean {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(id);
  }

  fetchJobs(): void {
    this.loading = true;
    this.error = null;
    const academyId = (environment.academyId || '').trim();
    const filterByAcademy = this.isGuid(academyId);

    this.api.getAcademyJob().subscribe({
      next: (res) => {
        console.log('jobs raw', res);
        const arr = Array.isArray(res) ? res : (res?.items || res?.data || res?.result || []);
        let list = Array.isArray(arr) ? arr : [];
        if (filterByAcademy) {
          list = list.filter((j: any) => (j.AcademyDataId || j.academyDataId) === academyId);
          if (!list.length && Array.isArray(arr) && arr.length) {
            console.warn('No jobs matched academyId; showing unfiltered jobs for visibility');
            list = arr;
          }
        }
        this.jobs = list.map((j: any) => ({
          id: j.id || j.Id || j.uid,
          title: j.JobNameL1 || j.JobNameL2 || j.title || 'وظيفة بدون عنوان',
          description: j.Description || j.description || '',
          link: j.JobLink || j.jobLink || '',
          branchId: j.BranchesDataId || j.branchesDataId || null,
          academyId: j.AcademyDataId || j.academyDataId || null,
        }));
      },
      error: (err) => {
        this.error = 'تعذر جلب الوظائف. الرجاء المحاولة لاحقاً.';
        console.error('getAcademyJob error', err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  apply(job: any) {
    const msg = `التقديم على وظيفة: ${job?.title || ''}`;
    console.log(msg);
    if (job?.link) {
      window.open(job.link, '_blank');
      return;
    }
    if (typeof window !== 'undefined') {
      window.alert('تم استلام طلب التقديم مبدئياً. سنقوم بالتواصل معك قريباً.');
    }
  }
}
