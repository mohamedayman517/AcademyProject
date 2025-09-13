import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GeminiApiService {
  private readonly apiKey = 'AIzaSyDdrJ3Wy46m4HNpGJGFzIUK5GZxGLnBX9g';
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(private http: HttpClient) {}

  /**
   * Handle chat message with Gemini API
   */
  handleChatMessage(message: string, chatHistory: any[] = []): Observable<any> {
    const prompt = this.buildChatPrompt(message, chatHistory);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });

    return this.http.post<any>(
      `${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
      requestBody,
      { headers }
    ).pipe(
      map(response => {
        if (response && response.candidates && response.candidates[0] && response.candidates[0].content) {
          return {
            success: true,
            response: response.candidates[0].content.parts[0].text
          };
        } else {
          return {
            success: false,
            fallbackResponse: this.getFallbackResponse(message)
          };
        }
      }),
      catchError(error => {
        console.warn('Gemini API Error (using fallback):', error.status || 'Network error');
        console.warn('Error details:', error);
        return of({
          success: false,
          fallbackResponse: this.getFallbackResponse(message)
        });
      })
    );
  }

  /**
   * Generate AI report
   */
  generateReport(reportData: any): Observable<any> {
    const prompt = this.buildReportPrompt(reportData);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });

    return this.http.post<any>(
      `${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
      requestBody,
      { headers }
    ).pipe(
      map(response => {
        if (response && response.candidates && response.candidates[0] && response.candidates[0].content) {
          return {
            success: true,
            report: response.candidates[0].content.parts[0].text
          };
        } else {
          return {
            success: false,
            report: this.getFallbackReport(reportData.type)
          };
        }
      }),
      catchError(error => {
        console.warn('Gemini API Error (using fallback):', error.status || 'Network error');
        console.warn('Error details:', error);
        return of({
          success: false,
          report: this.getFallbackReport(reportData.type)
        });
      })
    );
  }

  private buildChatPrompt(message: string, chatHistory: any[]): string {
    const systemPrompt = `You are an AI assistant for an educational academy system. You help students, teachers, and administrators with various tasks including:

1. Answering questions about courses, programs, and educational content
2. Helping with technical issues
3. Providing guidance on academy policies and procedures
4. Assisting with complaints and support requests
5. Generating reports and analysis

Please respond in a helpful, professional, and friendly manner. If the user asks about complaints, guide them to the complaints management system.

Current conversation context:`;

    let context = systemPrompt + '\n\n';
    
    // Add recent chat history (last 5 messages)
    const recentHistory = chatHistory.slice(-5);
    recentHistory.forEach(msg => {
      context += `${msg.sender}: ${msg.text}\n`;
    });
    
    context += `\nUser: ${message}\n\nAssistant:`;
    
    return context;
  }

  private buildReportPrompt(reportData: any): string {
    const basePrompt = `Generate a comprehensive ${reportData.type} report for an educational academy system. The report should include:

1. Executive Summary
2. Key Metrics and Statistics
3. Analysis and Insights
4. Recommendations
5. Next Steps

Report Type: ${reportData.type}
Period: ${reportData.period}
Available Data: ${reportData.data}

Please provide a detailed, professional report that would be useful for academy management.`;

    return basePrompt;
  }

  private getFallbackResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // ردود ذكية باللغة العربية
    if (lowerMessage.includes('شكوى') || lowerMessage.includes('شكاوى') || lowerMessage.includes('مشكلة') || lowerMessage.includes('مشاكل')) {
      return 'يمكنك إدارة الشكاوى من خلال تبويب "الشكاوى" في المساعد الذكي. يمكنك أيضاً زيارة صفحة إدارة الشكاوى الكاملة للوصول إلى جميع الميزات المتقدمة.';
    }
    
    if (lowerMessage.includes('تقرير') || lowerMessage.includes('تقارير') || lowerMessage.includes('report')) {
      return 'يمكنك إنشاء التقارير الذكية من خلال تبويب "التقارير" في المساعد الذكي. يتوفر تقارير الأداء وتقارير الحضور.';
    }
    
    if (lowerMessage.includes('مساعدة') || lowerMessage.includes('help') || lowerMessage.includes('ساعدني')) {
      return 'أنا هنا لمساعدتك! يمكنك استخدام التبويبات المختلفة في المساعد الذكي:\n• الدردشة: للأسئلة والاستفسارات\n• الشكاوى: لإدارة الشكاوى والتقارير\n• التقارير: لإنشاء التقارير الذكية';
    }
    
    if (lowerMessage.includes('مرحبا') || lowerMessage.includes('السلام') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'مرحباً بك! أنا المساعد الذكي للأكاديمية. كيف يمكنني مساعدتك اليوم؟';
    }
    
    if (lowerMessage.includes('شكرا') || lowerMessage.includes('thank you') || lowerMessage.includes('thanks')) {
      return 'العفو! أنا سعيد لمساعدتك. إذا كان لديك أي أسئلة أخرى، لا تتردد في السؤال.';
    }
    
    if (lowerMessage.includes('كورس') || lowerMessage.includes('دورة') || lowerMessage.includes('course') || lowerMessage.includes('برنامج')) {
      return 'يمكنك تصفح الدورات والبرامج المتاحة من خلال الصفحة الرئيسية. إذا كنت تبحث عن دورة معينة، يمكنك استخدام البحث أو تصفح الفئات المختلفة.';
    }
    
    if (lowerMessage.includes('تسجيل') || lowerMessage.includes('دخول') || lowerMessage.includes('login') || lowerMessage.includes('register')) {
      return 'يمكنك تسجيل الدخول أو إنشاء حساب جديد من خلال صفحة تسجيل الدخول. إذا واجهت أي مشاكل في التسجيل، يمكنك إرسال شكوى من خلال تبويب الشكاوى.';
    }
    
    // رد عام ذكي
    return 'أفهم سؤالك. يمكنني مساعدتك في:\n• إدارة الشكاوى والتقارير\n• الإجابة على الأسئلة حول الأكاديمية\n• توجيهك للصفحات المناسبة\n• إنشاء التقارير الذكية\n• حل المشاكل التقنية\n\nاستخدم التبويبات المختلفة للوصول إلى الميزات المتاحة.';
  }

  private getFallbackReport(type: string): string {
    const reportTemplates: { [key: string]: string } = {
      performance: `
# تقرير الأداء الأسبوعي

## الملخص التنفيذي
تم تحليل الأداء الأسبوعي للنظام التعليمي مع التركيز على المؤشرات الرئيسية.

## المؤشرات الرئيسية
- عدد الطلاب النشطين: [يتم تحديثه من النظام]
- معدل الحضور: [يتم تحديثه من النظام]
- عدد الشكاوى المفتوحة: [يتم تحديثه من النظام]

## التحليل والتوصيات
- مراجعة دورية لسجلات الحضور
- متابعة الشكاوى المعلقة
- تحسين تجربة المستخدم

## الخطوات التالية
- إعداد تقرير شهري شامل
- مراجعة السياسات التعليمية
- تطوير خطة التحسين المستمر
      `,
      attendance: `
# تقرير الحضور الأسبوعي

## الملخص التنفيذي
تقرير شامل عن معدلات الحضور للطلاب في مختلف البرامج التعليمية.

## إحصائيات الحضور
- إجمالي الطلاب المسجلين: [يتم تحديثه من النظام]
- معدل الحضور الإجمالي: [يتم تحديثه من النظام]
- عدد الغيابات: [يتم تحديثه من النظام]

## التحليل
- مراجعة أنماط الغياب
- تحديد الطلاب الذين يحتاجون متابعة
- تقييم فعالية البرامج التعليمية

## التوصيات
- التواصل مع الطلاب المتغيبين
- تطوير نظام تنبيهات الحضور
- تحسين جاذبية المحتوى التعليمي
      `
    };

    return reportTemplates[type] || `
# تقرير ${type}

## الملخص التنفيذي
تم إعداد تقرير شامل حول ${type} بناءً على البيانات المتاحة.

## النتائج الرئيسية
- [يتم تحديثه من النظام]

## التحليل والتوصيات
- [يتم تحديثه من النظام]

## الخطوات التالية
- [يتم تحديثه من النظام]
    `;
  }
}

