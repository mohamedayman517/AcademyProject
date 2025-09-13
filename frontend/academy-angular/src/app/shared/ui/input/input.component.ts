import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  template: `
    <div class="input-container">
      <input
        [type]="type"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [value]="value"
        [class]="getInputClasses()"
        (input)="onInput($event)"
        (blur)="onBlur()"
        (focus)="onFocus()"
      />
    </div>
  `,
  styles: [`
    .input-container {
      width: 100%;
    }

    input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      transition: all 0.3s ease;
      background: white;
      outline: none;
    }

    input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }

    input:disabled {
      background: #f9fafb;
      color: #6b7280;
      cursor: not-allowed;
    }

    input.error {
      border-color: #ef4444;
    }

    input.error:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() error: boolean = false;
  @Output() onInputChange = new EventEmitter<string>();
  @Output() onFocusEvent = new EventEmitter<void>();
  @Output() onBlurEvent = new EventEmitter<void>();

  value: string = '';

  private onChange = (value: string) => {};
  private onTouched = () => {};

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
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

  getInputClasses(): string {
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

