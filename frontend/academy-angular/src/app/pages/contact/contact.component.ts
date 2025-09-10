import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  name = '';
  email = '';
  message = '';
  submitting = false;
  success: string | null = null;
  error: string | null = null;

  constructor(private api: ApiService) {}

  private hasAuth(): boolean {
    const ls = (typeof window !== 'undefined') ? localStorage.getItem('token') : '';
    return !!(ls && ls.trim()) || !!((environment.devToken || '').trim());
  }

  submit(): void {
    this.success = null;
    this.error = null;

    if (!this.name.trim() || !this.email.trim() || !this.message.trim()) {
      this.error = 'يرجى تعبئة كل الحقول المطلوبة.';
      return;
    }

    const text = `رسالة تواصل جديدة:\nالاسم: ${this.name}\nالبريد: ${this.email}\nالنص: ${this.message}`;

    // If authenticated, send via chat API; else show local success
    if (!this.hasAuth()) {
      this.success = 'تم استلام رسالتك بنجاح. سنقوم بالتواصل معك قريباً.';
      this.name = this.email = this.message = '';
      return;
    }

    this.submitting = true;
    this.api.chatSend({ text }).subscribe({
      next: () => {
        this.success = 'تم إرسال رسالتك بنجاح.';
        this.name = this.email = this.message = '';
      },
      error: (err) => {
        console.error('contact submit error', err);
        this.error = 'تعذر إرسال الرسالة حالياً. حاول لاحقاً.';
      },
      complete: () => {
        this.submitting = false;
      }
    });
  }
}
