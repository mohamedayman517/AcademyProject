import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLang = new BehaviorSubject<string>('ar');
  public currentLang$ = this.currentLang.asObservable();

  private translations: { [key: string]: { [key: string]: string } } = {
    ar: {
      // Chat
      'chat': 'الدردشة',
      'type_your_message': 'اكتب رسالتك...',
      'ai_assistant': 'المساعد الذكي',
      'hello_how_can_i_help': 'مرحباً! كيف يمكنني مساعدتك اليوم؟',
      
      // Complaints
      'complaints': 'الشكاوى',
      'full_complaints_management': 'إدارة الشكاوى الكاملة',
      'add_new_complaint': 'إضافة شكوى جديدة',
      'select_complaint_type': 'اختر نوع الشكوى',
      'select_academy': 'اختر الأكاديمية',
      'select_branch': 'اختر الفرع',
      'student': 'الطالب',
      'no_student_matched': 'لم يتم التعرف على طالب للجلسة الحالية',
      'complaint_description_placeholder': 'وصف الشكوى (10 أحرف على الأقل)...',
      'submit_complaint': 'إرسال الشكوى',
      'file': 'ملف',
      'manage_complaints': 'إدارة الشكاوى',
      
      // Reports
      'reports': 'التقارير',
      'performance_report': 'تقرير الأداء',
      'attendance_report': 'تقرير الحضور',
      'view': 'عرض',
      'download': 'تحميل',
      'performance': 'أداء',
      'attendance': 'حضور',
      
      // Common
      'loading': 'جاري التحميل...',
      'error': 'خطأ',
      'success': 'نجح',
      'cancel': 'إلغاء',
      'save': 'حفظ',
      'edit': 'تعديل',
      'delete': 'حذف',
      'close': 'إغلاق',
      'send': 'إرسال',
      
      // Status messages
      'complaint_submitted_successfully': 'تم إرسال الشكوى بنجاح',
      'please_login_first': 'يجب تسجيل الدخول أولاً',
      'complaint_description_min_length': 'يجب أن يحتوي وصف الشكوى على 10 أحرف على الأقل',
      'please_select_academy': 'يرجى اختيار الأكاديمية',
      'please_select_branch': 'يرجى اختيار الفرع',
      'please_select_complaint_type': 'يرجى اختيار نوع الشكوى',
      'failed_to_submit_complaint': 'فشل إرسال الشكوى',
      'invalid_data_please_check_fields': 'بيانات غير صحيحة، يرجى التحقق من الحقول',
      'failed_to_auto_create_student': 'تعذّر إنشاء سجل الطالب تلقائياً',
      
      // Complaint types
      'technical_issue': 'مشكلة تقنية',
      'content_issue': 'مشكلة في المحتوى',
      'login_issue': 'مشكلة في تسجيل الدخول',
      
      // Complaint statuses
      'open': 'مفتوح',
      'in_progress': 'قيد المعالجة',
      'closed': 'مغلق',
      'new': 'جديد'
    },
    en: {
      // Chat
      'chat': 'Chat',
      'type_your_message': 'Type your message...',
      'ai_assistant': 'AI Assistant',
      'hello_how_can_i_help': 'Hello! How can I help you today?',
      
      // Complaints
      'complaints': 'Complaints',
      'full_complaints_management': 'Full Complaints Management',
      'add_new_complaint': 'Add New Complaint',
      'select_complaint_type': 'Select Complaint Type',
      'select_academy': 'Select Academy',
      'select_branch': 'Select Branch',
      'student': 'Student',
      'no_student_matched': 'No student matched for current session',
      'complaint_description_placeholder': 'Complaint description (minimum 10 characters)...',
      'submit_complaint': 'Submit Complaint',
      'file': 'File',
      'manage_complaints': 'Manage Complaints',
      
      // Reports
      'reports': 'Reports',
      'performance_report': 'Performance Report',
      'attendance_report': 'Attendance Report',
      'view': 'View',
      'download': 'Download',
      'performance': 'Performance',
      'attendance': 'Attendance',
      
      // Common
      'loading': 'Loading...',
      'error': 'Error',
      'success': 'Success',
      'cancel': 'Cancel',
      'save': 'Save',
      'edit': 'Edit',
      'delete': 'Delete',
      'close': 'Close',
      'send': 'Send',
      
      // Status messages
      'complaint_submitted_successfully': 'Complaint submitted successfully',
      'please_login_first': 'Please login first',
      'complaint_description_min_length': 'Complaint description must be at least 10 characters',
      'please_select_academy': 'Please select an academy',
      'please_select_branch': 'Please select a branch',
      'please_select_complaint_type': 'Please select a complaint type',
      'failed_to_submit_complaint': 'Failed to submit complaint',
      'invalid_data_please_check_fields': 'Invalid data, please check the fields',
      'failed_to_auto_create_student': 'Failed to auto-create student record',
      
      // Complaint types
      'technical_issue': 'Technical Issue',
      'content_issue': 'Content Issue',
      'login_issue': 'Login Issue',
      
      // Complaint statuses
      'open': 'Open',
      'in_progress': 'In Progress',
      'closed': 'Closed',
      'new': 'New'
    }
  };

  constructor() {
    // Try to get language from localStorage or default to Arabic
    const savedLang = localStorage.getItem('language') || 'ar';
    this.setLanguage(savedLang);
  }

  setLanguage(lang: string): void {
    this.currentLang.next(lang);
    localStorage.setItem('language', lang);
  }

  getCurrentLanguage(): string {
    return this.currentLang.value;
  }

  translate(key: string, params?: any): string {
    const lang = this.getCurrentLanguage();
    const translation = this.translations[lang]?.[key] || this.translations['ar']?.[key] || key;
    
    if (params) {
      return this.interpolate(translation, params);
    }
    
    return translation;
  }

  private interpolate(template: string, params: any): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] || match;
    });
  }

  // Helper method for components
  t(key: string, params?: any): string {
    return this.translate(key, params);
  }

  // Get RTL status
  isRtl(): boolean {
    return this.getCurrentLanguage() === 'ar';
  }
}

