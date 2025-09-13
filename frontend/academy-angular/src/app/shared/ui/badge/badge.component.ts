import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  template: `
    <span [class]="getBadgeClasses()">
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    span {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      border: 1px solid transparent;
    }

    .badge-default {
      background: #f3f4f6;
      color: #374151;
      border-color: #d1d5db;
    }

    .badge-primary {
      background: #dbeafe;
      color: #1e40af;
      border-color: #93c5fd;
    }

    .badge-secondary {
      background: #e5e7eb;
      color: #374151;
      border-color: #9ca3af;
    }

    .badge-success {
      background: #dcfce7;
      color: #166534;
      border-color: #86efac;
    }

    .badge-warning {
      background: #fef3c7;
      color: #92400e;
      border-color: #fcd34d;
    }

    .badge-error {
      background: #fee2e2;
      color: #991b1b;
      border-color: #fca5a5;
    }

    .badge-outline {
      background: transparent;
      color: #6b7280;
      border-color: #d1d5db;
    }

    .badge-sm {
      padding: 0.125rem 0.5rem;
      font-size: 0.625rem;
    }

    .badge-lg {
      padding: 0.375rem 1rem;
      font-size: 0.875rem;
    }
  `]
})
export class BadgeComponent {
  @Input() variant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' = 'default';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  getBadgeClasses(): string {
    const classes = [];
    
    classes.push(`badge-${this.variant}`);
    
    if (this.size !== 'md') {
      classes.push(`badge-${this.size}`);
    }
    
    return classes.join(' ');
  }
}

