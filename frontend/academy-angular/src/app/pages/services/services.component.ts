import { Component } from '@angular/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent {
  isRtl = false;
  langCode: 'ar' | 'en' = 'en';

  certificates: Array<{ id: number; title: string; description: string; icon: string; duration: string; level: string }>= [];
  features: Array<{ icon: string; title: string; description: string }>= [];
  steps: Array<{ number: number; title: string; description: string }>= [];

  constructor(private lang: LanguageService) {
    this.langCode = (this.lang.current || 'en') as any;
    this.isRtl = this.langCode === 'ar';
    this.setupContent();
    this.lang.currentLang$.subscribe(code => {
      this.langCode = (code as any) || 'en';
      this.isRtl = this.langCode === 'ar';
      this.setupContent();
    });
  }

  private setupContent(){
    const ar = this.langCode === 'ar';
    this.certificates = [
      {
        id: 1,
        title: ar ? 'تطوير الويب' : 'Web Development',
        description: ar
          ? 'شهادة تطوير الويب الشاملة تغطي HTML و CSS و JavaScript والأطر الحديثة'
          : 'Complete web development certification covering HTML, CSS, JavaScript, and modern frameworks',
        icon: '🌐',
        duration: ar ? '3-6 أشهر' : '3-6 months',
        level: ar ? 'مبتدئ - متقدم' : 'Beginner - Advanced'
      },
      {
        id: 2,
        title: ar ? 'علوم البيانات' : 'Data Science',
        description: ar
          ? 'شهادة علوم البيانات الشاملة تشمل Python والتعلم الآلي والتحليلات'
          : 'Comprehensive data science certification including Python, machine learning, and analytics',
        icon: '📊',
        duration: ar ? '4-8 أشهر' : '4-8 months',
        level: ar ? 'متوسط - متقدم' : 'Intermediate - Advanced'
      },
      {
        id: 3,
        title: ar ? 'التسويق الرقمي' : 'Digital Marketing',
        description: ar
          ? 'شهادة التسويق الرقمي المهنية تغطي SEO ووسائل التواصل الاجتماعي والتسويق بالمحتوى'
          : 'Professional digital marketing certification covering SEO, social media, and content marketing',
        icon: '📱',
        duration: ar ? '2-4 أشهر' : '2-4 months',
        level: ar ? 'مبتدئ - متوسط' : 'Beginner - Intermediate'
      },
      {
        id: 4,
        title: ar ? 'إدارة المشاريع' : 'Project Management',
        description: ar
          ? 'شهادة إدارة المشاريع مع الأدوات العملية والمنهجيات'
          : 'Project management certification with practical tools and methodologies',
        icon: '📋',
        duration: ar ? '3-5 أشهر' : '3-5 months',
        level: ar ? 'متوسط - متقدم' : 'Intermediate - Advanced'
      }
    ];

    this.features = [
      {
        icon: 'globe',
        title: ar ? 'معترف بها دولياً' : 'Internationally Recognized',
        description: ar ? 'شهادات مقبولة من أصحاب العمل في جميع أنحاء العالم' : 'Certificates accepted by employers worldwide'
      },
      {
        icon: 'clock',
        title: ar ? 'وصول مدى الحياة' : 'Lifetime Access',
        description: ar ? 'الوصول إلى شهاداتك في أي وقت وأي مكان' : 'Access your certificates anytime, anywhere'
      },
      {
        icon: 'shield',
        title: ar ? 'قابلة للتحقق' : 'Verifiable',
        description: ar ? 'نظام التحقق الرقمي لأصحاب العمل' : 'Digital verification system for employers'
      },
      {
        icon: 'award',
        title: ar ? 'جودة معتمدة' : 'Accredited Quality',
        description: ar ? 'برامج معتمدة بمعايير جودة معترف بها' : 'Accredited programs with recognized quality standards'
      }
    ];

    this.steps = [
      {
        number: 1,
        title: ar ? 'إكمال متطلبات الدورة' : 'Complete Course Requirements',
        description: ar ? 'إنهاء جميع الوحدات والواجبات والتقييمات في الدورة المختارة' : 'Finish all modules, assignments, and assessments in your chosen course'
      },
      {
        number: 2,
        title: ar ? 'اجتياز التقييم النهائي' : 'Pass Final Assessment',
        description: ar ? 'تحقيق الحد الأدنى المطلوب من النقاط في التقييم النهائي للدورة' : 'Achieve the minimum required score in the final course assessment'
      },
      {
        number: 3,
        title: ar ? 'تحميل الشهادة' : 'Download Certificate',
        description: ar ? 'الوصول إلى شهادتك وتحميلها من لوحة تحكم حسابك' : 'Access and download your certificate from your account dashboard'
      }
    ];
  }
}
