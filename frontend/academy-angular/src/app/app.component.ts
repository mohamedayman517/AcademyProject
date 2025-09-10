import { Component } from '@angular/core';
import { LanguageService, AppLanguage } from './services/language.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'أكاديمية الإبداع';
  currentYear: number = new Date().getFullYear();

  constructor(public lang: LanguageService) {}

  setLang(l: AppLanguage): void {
    this.lang.set(l);
  }
}
