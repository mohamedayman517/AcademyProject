import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-courses-section',
  template: `
    <section id="courses" class="py-16 bg-muted/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="ltr">
        <!-- العنوان الرئيسي -->
        <div class="text-center mb-12">
          <h2 class="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {{ 'courses_section_title' | t }}
          </h2>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
            {{ 'courses_section_subtitle' | t }}
          </p>
        </div>

        <!-- أدوات التصفية والعرض -->
        <div class="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4">
          <!-- فئات الدورات -->
          <div class="flex flex-wrap gap-2">
            <button
              *ngFor="let category of categories"
              [class]="selectedCategory === category.id ? 'academy-button' : 'category-button'"
              (click)="setSelectedCategory(category.id)">
              {{ category.name | t }}
            </button>
          </div>

          <!-- أدوات العرض -->
          <div class="flex items-center gap-2">
            <button
              [class]="viewMode === 'grid' ? 'view-button active' : 'view-button'"
              (click)="setViewMode('grid')">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
              </svg>
            </button>
            <button
              [class]="viewMode === 'list' ? 'view-button active' : 'view-button'"
              (click)="setViewMode('list')">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- عرض الدورات -->
        <div class="grid gap-8 mb-12" [class]="viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'">
          <div *ngFor="let course of filteredCourses; let i = index" 
               class="academy-card"
               [@slideInUp]="'in'">
            <div class="course-image">
              <img [src]="course.image" [alt]="course.title" class="w-full h-48 object-cover">
              <div class="course-level">{{ course.level }}</div>
            </div>
            <div class="course-content">
              <h3 class="course-title">{{ course.title }}</h3>
              <p class="course-description">{{ course.description }}</p>
              <div class="course-meta">
                <span class="duration">{{ course.duration }}</span>
                <span class="students">{{ course.students }} {{ 'students_lbl' | t }}</span>
                <span class="rating">{{ course.rating }}</span>
              </div>
              <button class="course-button" (click)="startLearning(course)">{{ 'start_learning' | t }}</button>
            </div>
          </div>
        </div>


        <!-- زر عرض المزيد -->
        <div class="text-center">
          <button class="view-all-button" (click)="viewAllCourses()">
            {{ 'view_all_courses' | t }}
            <svg class="mr-2 h-5 w-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .py-16 { padding: 4rem 0; }
    .bg-muted\\/30 { background-color: rgba(248, 250, 252, 0.3); }
    .max-w-7xl { max-width: 80rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .sm\\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .lg\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
    .text-center { text-align: center; }
    .mb-12 { margin-bottom: 3rem; }
    .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
    .lg\\:text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
    .font-bold { font-weight: 700; }
    .text-foreground { color: var(--foreground); }
    .mb-4 { margin-bottom: 1rem; }
    .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .text-muted-foreground { color: var(--muted-foreground); }
    .max-w-2xl { max-width: 42rem; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .lg\\:flex-row { flex-direction: row; }
    .justify-between { justify-content: space-between; }
    .items-center { align-items: center; }
    .mb-8 { margin-bottom: 2rem; }
    .gap-4 { gap: 1rem; }
    .flex-wrap { flex-wrap: wrap; }
    .gap-2 { gap: 0.5rem; }
    .academy-button {
      background: var(--primary);
      color: var(--primary-foreground);
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-weight: 500;
      transition: all 0.2s;
      border: none;
      cursor: pointer;
    }
    .category-button {
      background: transparent;
      color: var(--muted-foreground);
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-weight: 500;
      transition: all 0.2s;
      border: 1px solid var(--border);
      cursor: pointer;
    }
    .category-button:hover {
      background: var(--muted);
      color: var(--foreground);
    }
    .view-button {
      background: transparent;
      color: var(--muted-foreground);
      padding: 0.5rem;
      border-radius: 0.5rem;
      border: 1px solid var(--border);
      cursor: pointer;
      transition: all 0.2s;
    }
    .view-button.active {
      background: var(--primary);
      color: var(--primary-foreground);
      border-color: var(--primary);
    }
    .view-button:hover {
      background: var(--muted);
      color: var(--foreground);
    }
    .grid { display: grid; }
    .gap-8 { gap: 2rem; }
    .mb-12 { margin-bottom: 3rem; }
    .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .academy-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      transition: box-shadow 0.3s;
      overflow: hidden;
    }
    .academy-card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .course-image {
      position: relative;
    }
    .w-full { width: 100%; }
    .h-48 { height: 12rem; }
    .object-cover { object-fit: cover; }
    .course-level {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: var(--primary);
      color: var(--primary-foreground);
      padding: 0.25rem 0.75rem;
      border-radius: 1.25rem;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .course-content {
      padding: 1.5rem;
    }
    .course-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--foreground);
      margin-bottom: 0.5rem;
    }
    .course-description {
      color: var(--muted-foreground);
      font-size: 0.875rem;
      line-height: 1.5;
      margin-bottom: 1rem;
    }
    .course-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      font-size: 0.75rem;
      color: var(--muted-foreground);
    }
    .course-button {
      width: 100%;
      background: var(--primary);
      color: var(--primary-foreground);
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    .course-button:hover {
      background: var(--primary-dark);
      transform: translateY(-1px);
    }
    .view-all-button {
      background: transparent;
      color: var(--primary);
      border: 2px solid var(--primary);
      padding: 0.75rem 2rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    .view-all-button:hover {
      background: var(--primary);
      color: var(--primary-foreground);
    }
    .mr-2 { margin-right: 0.5rem; }
    .h-5 { height: 1.25rem; }
    .w-5 { width: 1.25rem; }
    .inline { display: inline; }
    .h-4 { height: 1rem; }
    .w-4 { width: 1rem; }

    @media (max-width: 640px) {
      .sm\\:px-6 { padding-left: 1rem; padding-right: 1rem; }
    }

    @media (max-width: 768px) {
      .md\\:grid-cols-2 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    }

    @media (max-width: 1024px) {
      .lg\\:px-8 { padding-left: 1.5rem; padding-right: 1.5rem; }
      .lg\\:text-4xl { font-size: 1.875rem; line-height: 2.25rem; }
      .lg\\:flex-row { flex-direction: column; }
      .lg\\:grid-cols-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .lg\\:grid-cols-2 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    }
  `],
  animations: [
    trigger('slideInUp', [
      state('in', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('void => *', [
        style({
          opacity: 0,
          transform: 'translateY(20px)'
        }),
        animate('0.6s ease-out')
      ])
    ])
  ]
})
export class CoursesSectionComponent implements OnInit {
  courses: any[] = [];
  selectedCategory = 'all';
  viewMode = 'grid';

  categories = [
    { id: 'all', name: 'all_courses' },
    { id: 'tech', name: 'technology' },
    { id: 'business', name: 'business' },
    { id: 'design', name: 'design' },
    { id: 'language', name: 'languages' },
    { id: 'skills', name: 'self_development' }
  ];

  constructor(private router: Router) {
    // Initialize courses array first
    this.courses = [];
    
    // Course data matching React version - English courses
    setTimeout(() => {
      this.courses = [
        {
          id: 1,
          title: 'Web Development',
          description: 'Learn the fundamentals of web development using HTML, CSS, JavaScript',
          duration: '8 weeks',
          students: '2,450',
          rating: '4.9',
          level: 'Beginner',
          category: 'tech',
          image: 'assets/images/course_placeholder-DE1r9TwW.png'
        },
        {
          id: 2,
          title: 'Modern Business Management',
          description: 'Leadership and management skills in contemporary work environment',
          duration: '6 weeks',
          students: '1,890',
          rating: '4.7',
          level: 'Intermediate',
          category: 'business',
          image: 'assets/images/course_placeholder-DE1r9TwW.png'
        },
        {
          id: 3,
          title: 'Graphic Design',
          description: 'Fundamentals of graphic design and Adobe Creative Suite programs',
          duration: '10 weeks',
          students: '3,200',
          rating: '4.8',
          level: 'Beginner',
          category: 'design',
          image: 'assets/images/course_placeholder-DE1r9TwW.png'
        },
        {
          id: 4,
          title: 'Business English',
          description: 'Develop English language skills in the workplace',
          duration: '12 weeks',
          students: '4,100',
          rating: '4.6',
          level: 'Intermediate',
          category: 'language',
          image: 'assets/images/course_placeholder-DE1r9TwW.png'
        },
        {
          id: 5,
          title: 'Effective Communication Skills',
          description: 'Develop communication, presentation and public speaking skills',
          duration: '4 weeks',
          students: '2,800',
          rating: '4.9',
          level: 'Easy',
          category: 'skills',
          image: 'assets/images/course_placeholder-DE1r9TwW.png'
        },
        {
          id: 6,
          title: 'Python Programming',
          description: 'Learn programming fundamentals and practical applications',
          duration: '14 weeks',
          students: '5,600',
          rating: '4.8',
          level: 'Intermediate',
          category: 'tech',
          image: 'assets/images/course_placeholder-DE1r9TwW.png'
        }
      ];
    }, 100);
  }

  ngOnInit(): void {}

  get filteredCourses() {
    if (this.selectedCategory === 'all') {
      return this.courses;
    }
    return this.courses.filter(course => course.category === this.selectedCategory);
  }

  setSelectedCategory(categoryId: string) {
    this.selectedCategory = categoryId;
  }

  setViewMode(mode: string) {
    this.viewMode = mode;
  }

  startLearning(course: any) {
    // Navigate to courses page with search query
    this.router.navigate(['/courses'], { 
      queryParams: { 
        search: course.title,
        category: course.category 
      } 
    });
  }

  viewAllCourses() {
    // Navigate to courses page without any filters
    this.router.navigate(['/courses']);
  }
}
