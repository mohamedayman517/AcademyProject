import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { CoursesComponent } from './pages/courses/courses.component';
import { ProgramsComponent } from './pages/programs/programs.component';
import { ApiTestComponent } from './components/api-test/api-test.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { RegisterComponent } from './pages/register/register.component';
import { ChatWidgetComponent } from './components/chat-widget/chat-widget.component';
import { FooterComponent } from './components/footer/footer.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { BranchesComponent } from './pages/branches/branches.component';
import { CareersComponent } from './pages/careers/careers.component';
import { ContactComponent } from './pages/contact/contact.component';
import { LoginComponent } from './pages/login/login.component';
import { ApiHealthComponent } from './pages/api-health/api-health.component';
import { ComplaintsComponent } from './pages/complaints/complaints.component';
import { ComplaintsWrapperComponent } from './pages/complaints-wrapper/complaints-wrapper.component';
import { ContentUploadComponent } from './pages/content-upload/content-upload.component';
import { ProgramDetailsViewComponent } from './pages/program-details-view/program-details-view.component';
import { ProjectDetailsViewComponent } from './pages/project-details-view/project-details-view.component';
import { VideoGalleryComponent } from './pages/video-gallery/video-gallery.component';
import { VideoViewComponent } from './pages/video-view/video-view.component';
import { HeroComponent } from './components/hero/hero.component';
import { CoursesSectionComponent } from './components/courses-section/courses-section.component';
import { StatsBarComponent } from './components/stats-bar/stats-bar.component';
import { FeaturesComponent } from './components/features/features.component';
import { CTASectionComponent } from './components/cta-section/cta-section.component';
import { ServicesComponent } from './pages/services/services.component';
import { AccountComponent } from './pages/account/account.component';
import { TranslatePipe } from './pipes/translate.pipe';
import { HeaderComponent } from './components/header/header.component';
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

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CoursesComponent,
    ProgramsComponent,
    ApiTestComponent,
    ProjectsComponent,
    RegisterComponent,
    ChatWidgetComponent,
    FooterComponent,
    BranchesComponent,
    CareersComponent,
    ContactComponent,
    LoginComponent,
    ApiHealthComponent,
    ComplaintsComponent,
    ComplaintsWrapperComponent,
    ContentUploadComponent,
    ProgramDetailsViewComponent,
    ProjectDetailsViewComponent,
    VideoGalleryComponent,
    VideoViewComponent,
    HeroComponent,
    CoursesSectionComponent,
    StatsBarComponent,
    FeaturesComponent,
    CTASectionComponent,
    ServicesComponent,
    AccountComponent,
    TranslatePipe,
    HeaderComponent,
    ProjectsDetailsComponent,
    SessionsComponent,
    StudentsComponent,
    StudentsDataComponent,
    StudentsAttendanceComponent,
    StudentsEvaluationsComponent,
    CertificatesComponent,
    TrainersComponent,
    JobsComponent,
    ProfileComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule,
    AppRoutingModule,
    FormsModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
