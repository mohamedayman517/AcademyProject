import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      [class]="getButtonClasses()"
      (click)="onClick.emit($event)"
    >
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.5rem;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    .btn-primary {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #e5e7eb;
      color: #111827;
      transform: translateY(-1px);
    }

    .btn-outline {
      background: transparent;
      color: #3b82f6;
      border: 1px solid #3b82f6;
    }

    .btn-outline:hover:not(:disabled) {
      background: #3b82f6;
      color: white;
    }

    .btn-ghost {
      background: transparent;
      color: #6b7280;
    }

    .btn-ghost:hover:not(:disabled) {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    .btn-sm {
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
    }

    .btn-lg {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
    }

    .btn-full {
      width: 100%;
    }

    .academy-button {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
    }

    .academy-button:hover:not(:disabled) {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }
  `]
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled: boolean = false;
  @Input() fullWidth: boolean = false;
  @Input() academyStyle: boolean = false;
  @Output() onClick = new EventEmitter<Event>();

  getButtonClasses(): string {
    const classes = [];
    
    if (this.academyStyle) {
      classes.push('academy-button');
    } else {
      classes.push(`btn-${this.variant}`);
    }
    
    if (this.size !== 'md') {
      classes.push(`btn-${this.size}`);
    }
    
    if (this.fullWidth) {
      classes.push('btn-full');
    }
    
    return classes.join(' ');
  }
}

