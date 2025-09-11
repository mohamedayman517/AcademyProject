import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-trainer-profile',
  templateUrl: './trainer-profile.component.html',
  styleUrls: ['./trainer-profile.component.css']
})
export class TrainerProfileComponent implements OnInit {
  isRtl = false;
  loading = true;
  trainer: any = null;

  constructor(private route: ActivatedRoute, private api: ApiService, private lang: LanguageService, private router: Router) {}

  ngOnInit(): void {
    this.isRtl = this.lang.current === 'ar';
    const id = this.route.snapshot.paramMap.get('id') || '';
    if (!id) { this.loading = false; return; }
    this.api.getTeacherData().subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : [];
        const found = list.find((t: any) => (t.id || t.Id || '').toString() === id.toString());
        if (found) {
          this.trainer = {
            id: found.id || found.Id,
            name: found.teacherNameL1 || found.TeacherNameL1 || found.teacherNameL2 || found.TeacherNameL2 || 'Unknown',
            description: found.description || found.Description || '',
            image: found.imageFile || found.ImageFile || '',
            email: found.teacherEmail || found.TeacherEmail || '',
            phone: found.teacherMobile || found.TeacherMobile || found.teacherPhone || found.TeacherPhone || '',
          };
        }
      },
      error: () => {},
      complete: () => { this.loading = false; }
    });
  }

  goBack(): void { this.router.navigateByUrl('/trainers'); }

  editCurrent(): void {
    const id = this.trainer?.id;
    if (!id) { return; }
    this.router.navigate(['/trainers/edit'], { queryParams: { id } });
  }
}


