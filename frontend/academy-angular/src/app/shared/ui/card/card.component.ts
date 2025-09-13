import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  template: `
    <div [class]="getCardClasses()">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .card {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }

    .card-hover:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transform: translateY(-1px);
      transition: all 0.2s ease;
    }

    .card-elevated {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
  `]
})
export class CardComponent {
  @Input() hover: boolean = false;
  @Input() elevated: boolean = false;

  getCardClasses(): string {
    const classes = ['card'];
    
    if (this.hover) {
      classes.push('card-hover');
    }
    
    if (this.elevated) {
      classes.push('card-elevated');
    }
    
    return classes.join(' ');
  }
}

@Component({
  selector: 'app-card-header',
  template: `
    <div class="card-header">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .card-header {
      padding: 1.5rem 1.5rem 0 1.5rem;
    }
  `]
})
export class CardHeaderComponent {}

@Component({
  selector: 'app-card-title',
  template: `
    <h3 class="card-title">
      <ng-content></ng-content>
    </h3>
  `,
  styles: [`
    .card-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
      margin: 0 0 0.5rem 0;
    }
  `]
})
export class CardTitleComponent {}

@Component({
  selector: 'app-card-content',
  template: `
    <div class="card-content">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .card-content {
      padding: 1.5rem;
    }
  `]
})
export class CardContentComponent {}

