import { Component } from '@angular/core';

@Component({
  selector: 'app-complaints-wrapper',
  template: `
    <section class="container">
      <h1>Complaints Wrapper</h1>
      <p>ملف تغليف لصفحة الشكاوى</p>
      <router-outlet></router-outlet>
    </section>
  `,
  styles: [`
    .container{padding:24px}
  `]
})
export class ComplaintsWrapperComponent {}
