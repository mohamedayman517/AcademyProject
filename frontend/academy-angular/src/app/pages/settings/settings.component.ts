import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  isRtl = false;
  reduceMotion = false;
  compactLayout = false;

  private readonly LS_KEYS = {
    reduceMotion: 'pref_reduce_motion',
    compactLayout: 'pref_compact_layout',
  };

  constructor(
    private languageService: LanguageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isRtl = this.languageService.current === 'ar';
    this.loadPreferences();
  }

  private loadPreferences(): void {
    try {
      this.reduceMotion = localStorage.getItem(this.LS_KEYS.reduceMotion) === '1';
      this.compactLayout = localStorage.getItem(this.LS_KEYS.compactLayout) === '1';
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }

  onLanguageChange(lang: string): void {
    this.languageService.set(lang as 'ar' | 'en');
    this.isRtl = this.languageService.current === 'ar';
  }

  onReduceMotionChange(checked: boolean): void {
    this.reduceMotion = checked;
    try {
      localStorage.setItem(this.LS_KEYS.reduceMotion, checked ? '1' : '0');
    } catch (error) {
      console.error('Error saving reduce motion preference:', error);
    }
  }

  onCompactLayoutChange(checked: boolean): void {
    this.compactLayout = checked;
    try {
      localStorage.setItem(this.LS_KEYS.compactLayout, checked ? '1' : '0');
    } catch (error) {
      console.error('Error saving compact layout preference:', error);
    }
  }

  reset(): void {
    this.languageService.set('en');
    this.reduceMotion = false;
    this.compactLayout = false;
    try {
      localStorage.removeItem(this.LS_KEYS.reduceMotion);
      localStorage.removeItem(this.LS_KEYS.compactLayout);
    } catch (error) {
      console.error('Error resetting preferences:', error);
    }
  }

  navigateToAccount(): void {
    this.router.navigate(['/account']);
  }

  navigateToHelp(): void {
    this.router.navigate(['/help']);
  }

  get currentLanguage(): string {
    return this.languageService.current;
  }

  get translations() {
    return {
      title: this.isRtl ? 'الإعدادات' : 'Settings',
      subtitle: this.isRtl ? 'إدارة تفضيلاتك وتخصيص تجربتك' : 'Manage your preferences and customize your experience',
      language: {
        title: this.isRtl ? 'اللغة' : 'Language',
        description: this.isRtl ? 'اختر اللغة المفضلة لك' : 'Choose your preferred language',
        selectLabel: this.isRtl ? 'اختر اللغة' : 'Select Language',
        en: this.isRtl ? 'الإنجليزية' : 'English',
        ar: this.isRtl ? 'العربية' : 'Arabic'
      },
      site: {
        title: this.isRtl ? 'تفضيلات الموقع' : 'Site Preferences',
        subtitle: this.isRtl ? 'تخصيص كيفية عمل الموقع' : 'Customize how the site works',
        reduceMotionLabel: this.isRtl ? 'تقليل الحركة' : 'Reduce Motion',
        reduceMotionDesc: this.isRtl ? 'تقليل الرسوم المتحركة والانتقالات' : 'Reduce animations and transitions',
        compactLayoutLabel: this.isRtl ? 'تخطيط مضغوط' : 'Compact Layout',
        compactLayoutDesc: this.isRtl ? 'استخدام مساحة أقل على الشاشة' : 'Use less space on screen'
      },
      myAccount: this.isRtl ? 'حسابي' : 'My Account',
      help: this.isRtl ? 'المساعدة' : 'Help',
      open: this.isRtl ? 'فتح' : 'Open',
      reset: this.isRtl ? 'إعادة تعيين' : 'Reset'
    };
  }
}
