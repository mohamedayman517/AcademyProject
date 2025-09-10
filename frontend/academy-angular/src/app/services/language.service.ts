import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppLanguage = 'ar' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly storageKey = 'app_lang';
  private readonly defaultLang: AppLanguage = 'en';
  private currentLangSubject = new BehaviorSubject<AppLanguage>(this.readInitial());
  readonly currentLang$ = this.currentLangSubject.asObservable();

  get current(): AppLanguage {
    return this.currentLangSubject.value;
  }

  set(lang: AppLanguage): void {
    if (lang !== 'ar' && lang !== 'en') return;
    if (lang === this.current) return;
    this.currentLangSubject.next(lang);
    try { localStorage.setItem(this.storageKey, lang); } catch {}
    this.applyDirection(lang);
  }

  toggle(): void {
    this.set(this.current === 'ar' ? 'en' : 'ar');
  }

  private readInitial(): AppLanguage {
    try {
      const saved = localStorage.getItem(this.storageKey) as AppLanguage | null;
      const lang = saved ? (saved === 'en' ? 'en' : 'ar') : this.defaultLang;
      this.applyDirection(lang);
      return lang;
    } catch {
      this.applyDirection(this.defaultLang);
      return this.defaultLang;
    }
  }

  private applyDirection(lang: AppLanguage): void {
    const html = document.documentElement;
    const body = document.body;
    if (!html || !body) return;
    const isEn = lang === 'en';
    html.setAttribute('lang', isEn ? 'en' : 'ar');
    html.setAttribute('dir', isEn ? 'ltr' : 'rtl');
    body.classList.toggle('dir-ltr', isEn);
    body.classList.toggle('dir-rtl', !isEn);
  }
}


