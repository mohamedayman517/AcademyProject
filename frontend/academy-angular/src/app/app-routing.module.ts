import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CoursesComponent } from './pages/courses/courses.component';
import { ProgramsComponent } from './pages/programs/programs.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { ApiTestComponent } from './components/api-test/api-test.component';
import { RegisterComponent } from './pages/register/register.component';
import { BranchesComponent } from './pages/branches/branches.component';
import { CareersComponent } from './pages/careers/careers.component';
import { ContactComponent } from './pages/contact/contact.component';
import { LoginComponent } from './pages/login/login.component';
import { ApiHealthComponent } from './pages/api-health/api-health.component';
import { ComplaintsWrapperComponent } from './pages/complaints-wrapper/complaints-wrapper.component';
import { ComplaintsComponent } from './pages/complaints/complaints.component';
import { ContentUploadComponent } from './pages/content-upload/content-upload.component';
import { ProgramDetailsViewComponent } from './pages/program-details-view/program-details-view.component';
import { ProjectDetailsViewComponent } from './pages/project-details-view/project-details-view.component';
import { VideoGalleryComponent } from './pages/video-gallery/video-gallery.component';
import { VideoViewComponent } from './pages/video-view/video-view.component';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';
import { AccountComponent } from './pages/account/account.component';
import { ProjectsDetailsComponent } from './pages/projects-details/projects-details.component';
import { SessionsComponent } from './pages/sessions/sessions.component';
import { StudentsComponent } from './pages/students/students.component';
import { StudentsDataComponent } from './pages/students-data/students-data.component';
import { StudentsAttendanceComponent } from './pages/students-attendance/students-attendance.component';
import { StudentsEvaluationsComponent } from './pages/students-evaluations/students-evaluations.component';
import { CertificatesComponent } from './pages/certificates/certificates.component';
import { TrainersComponent } from './pages/trainers/trainers.component';
import { JobsComponent } from './pages/jobs/jobs.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { TrainerProfileComponent } from './pages/trainer-profile/trainer-profile.component';
import { TrainerEditComponent } from './pages/trainer-edit/trainer-edit.component';
import { EvaluationsComponent } from './pages/evaluations/evaluations.component';
import { ServicesComponent } from './pages/services/services.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'courses', component: CoursesComponent },
  { path: 'programs', component: ProgramsComponent, canActivate: [AdminGuard] },
  { path: 'projects', component: ProjectsComponent, canActivate: [AdminGuard] },
  { path: 'projects-details', component: ProjectsDetailsComponent, canActivate: [AdminGuard] },
  { path: 'sessions', component: SessionsComponent, canActivate: [AdminGuard] },
  { path: 'services', component: ServicesComponent },
  { path: 'students', component: StudentsComponent, canActivate: [AdminGuard] },
  { path: 'students/data', component: StudentsDataComponent, canActivate: [AdminGuard] },
  { path: 'students/attendance', component: StudentsAttendanceComponent, canActivate: [AdminGuard] },
  { path: 'students/evaluations', component: StudentsEvaluationsComponent, canActivate: [AdminGuard] },
  { path: 'certificates', component: CertificatesComponent, canActivate: [AdminGuard] },
  { path: 'trainers', component: TrainersComponent },
  { path: 'trainers/soft-skills', component: TrainersComponent },
  { path: 'trainers/technical', component: TrainersComponent },
  { path: 'trainers/freelancer', component: TrainersComponent },
  { path: 'trainers/english', component: TrainersComponent },
  { path: 'trainer/:id', component: TrainerProfileComponent },
  { path: 'trainers/edit', component: TrainerEditComponent },
  { path: 'jobs', component: JobsComponent, canActivate: [AdminGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'api-test', component: ApiTestComponent },
  { path: 'login', component: LoginComponent },
  { path: 'branches', component: BranchesComponent, canActivate: [AdminGuard] },
  { path: 'careers', component: CareersComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'api-health', component: ApiHealthComponent, canActivate: [AdminGuard] },
  { path: 'account', component: AccountComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'evaluations', component: EvaluationsComponent, canActivate: [AuthGuard] },
  {
    path: 'complaints',
    component: ComplaintsWrapperComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', component: ComplaintsComponent }
    ]
  },
  { path: 'upload', component: ContentUploadComponent, canActivate: [AdminGuard] },
  { path: 'programs/:id', component: ProgramDetailsViewComponent },
  { path: 'projects/:id', component: ProjectDetailsViewComponent },
  { path: 'videos', component: VideoGalleryComponent },
  { path: 'video/:id', component: VideoViewComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { bindToComponentInputs: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
