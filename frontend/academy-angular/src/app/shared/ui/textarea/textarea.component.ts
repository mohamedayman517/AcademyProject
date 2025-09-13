import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-textarea',
  template: `
    <div class="textarea-container">
      <textarea
        [placeholder]="placeholder"
        [disabled]="disabled"
        [rows]="rows"
        [value]="value"
        [class]="getTextareaClasses()"
        (input)="onInput($event)"
        (blur)="onBlur()"
        (focus)="onFocus()"
      ></textarea>
    </div>
  `,
  styles: [`
    .textarea-container {
      width: 100%;
    }

    textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      transition: all 0.3s ease;
      background: white;
      outline: none;
      resize: vertical;
      min-height: 80px;
      font-family: inherit;
    }

    textarea:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }

    textarea:disabled {
      background: #f9fafb;
      color: #6b7280;
      cursor: not-allowed;
    }

    textarea.error {
      border-color: #ef4444;
    }

    textarea.error:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true
    }
  ]
})
export class TextareaComponent implements ControlValueAccessor {
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() rows: number = 4;
  @Input() error: boolean = false;
  @Output() onInputChange = new EventEmitter<string>();
  @Output() onFocusEvent = new EventEmitter<void>();
  @Output() onBlurEvent = new EventEmitter<void>();

  value: string = '';

  private onChange = (value: string) => {};
  private onTouched = () => {};

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
    this.onInputChange.emit(this.value);
  }

  onFocus(): void {
    this.onFocusEvent.emit();
  }

  onBlur(): void {
    this.onTouched();
    this.onBlurEvent.emit();
  }

  getTextareaClasses(): string {
    return this.error ? 'error' : '';
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

