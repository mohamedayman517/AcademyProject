import { Component } from '@angular/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent {
  isRtl = false;
  services = [
    { title: 'service_training', desc: 'service_training_desc', icon: '📘' },
    { title: 'service_consulting', desc: 'service_consulting_desc', icon: '🧭' },
    { title: 'service_support', desc: 'service_support_desc', icon: '🛠️' },
  ];

  constructor(private lang: LanguageService) {
    this.isRtl = (this.lang.current || 'en') === 'ar';
    this.lang.currentLang$.subscribe(code => this.isRtl = code === 'ar');
  }
}
