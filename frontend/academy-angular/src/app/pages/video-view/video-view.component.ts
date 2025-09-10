import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-video-view',
  template: `
    <section class="video-view-page" dir="rtl">
      <!-- Breadcrumb -->
      <div class="breadcrumb container">
        <a routerLink="/videos" class="breadcrumb-link">
          <svg viewBox="0 0 24 24" width="16" height="16"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          العودة إلى مكتبة الفيديوهات
        </a>
      </div>

      <div *ngIf="loading" class="container loading">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>جاري تحميل الفيديو...</p>
        </div>
      </div>

      <div *ngIf="error" class="container error">
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <h3>حدث خطأ في تحميل الفيديو</h3>
          <p>{{ error }}</p>
          <button class="retry-btn" (click)="retry()">إعادة المحاولة</button>
        </div>
      </div>

      <ng-container *ngIf="!loading && !error">
        <div *ngIf="item; else notFound" class="video-content">
          <!-- Video Header -->
          <div class="video-header container">
            <h1 class="video-title">{{ item?.SessionNameL1 || item?.sessionNameL1 || item?.SessionNameL2 || item?.sessionNameL2 || item?.Title || item?.Name || 'فيديو' }}</h1>
            <div class="video-meta">
              <span class="meta-item">
                <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                فيديو تعليمي
              </span>
              <span class="meta-dot"></span>
              <span class="meta-item">
                <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                متاح للعرض
              </span>
            </div>
          </div>

          <!-- Video Player Section -->
          <div class="video-player-section container">
            <div class="video-container">
              <div *ngIf="videoUrl; else noVideo" class="video-wrapper">
                <!-- YouTube/Vimeo Embed -->
                <div *ngIf="safeEmbedUrl" class="embed-container">
                  <iframe
                    [src]="safeEmbedUrl"
                    title="session video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    class="embed-player">
                  </iframe>
                </div>
                
                <!-- Direct Video -->
                <video 
                  *ngIf="!safeEmbedUrl"
                  [src]="getEmbedUrl(videoUrl) || videoUrl" 
                  controls 
                  preload="metadata"
                  class="video-player"
                  (loadstart)="onVideoLoadStart()"
                  (canplay)="onVideoCanPlay()"
                  (error)="onVideoError($event)">
                  متصفحك لا يدعم تشغيل الفيديو
                </video>
                
                <div class="video-overlay" *ngIf="videoLoading">
                  <div class="video-loading">
                    <div class="spinner"></div>
                    <p>جاري تحميل الفيديو...</p>
                  </div>
                </div>
              </div>
              <ng-template #noVideo>
                <div class="no-video-content">
                  <div class="no-video-icon">🎥</div>
                  <h3>لا يمكن تشغيل الفيديو</h3>
                  <p>لا يوجد رابط فيديو صالح متاح حالياً</p>
                  <div class="video-debug" *ngIf="item">
                    <details>
                      <summary>عرض بيانات الفيديو (للمطورين)</summary>
                      <pre class="json">{{ item | json }}</pre>
                    </details>
                  </div>
                </div>
              </ng-template>
            </div>
          </div>

          <!-- Video Details -->
          <div class="video-details container" *ngIf="item?.Description || item?.description">
            <div class="details-card">
              <h3>وصف الفيديو</h3>
              <p class="video-description">{{ item?.Description || item?.description }}</p>
            </div>
          </div>

          <!-- Related Videos Section -->
          <div class="related-videos container" *ngIf="relatedVideos.length > 0">
            <h3>فيديوهات ذات صلة</h3>
            <div class="related-grid">
              <a class="related-card" *ngFor="let related of relatedVideos" [routerLink]="['/video', related?.Id || related?.id]">
                <div class="related-thumbnail">
                  <div class="play-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
                <div class="related-info">
                  <h4>{{ related?.Title || related?.Name || 'فيديو' }}</h4>
                </div>
              </a>
            </div>
          </div>
        </div>

        <ng-template #notFound>
          <div class="container not-found">
            <div class="not-found-content">
              <div class="not-found-icon">🔍</div>
              <h3>الفيديو غير موجود</h3>
              <p>لا يمكن العثور على الفيديو المطلوب</p>
              <a routerLink="/videos" class="back-btn">العودة إلى مكتبة الفيديوهات</a>
            </div>
          </div>
        </ng-template>
      </ng-container>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .video-view-page {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      min-height: 100vh;
      position: relative;
      overflow: hidden;
    }

    .video-view-page::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="1" fill="rgba(42, 118, 210, 0.08)"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
      opacity: 0.6;
    }

    .container { 
      max-width: 1200px; 
      width: 98%; 
      margin-inline: auto; 
      position: relative;
      z-index: 1;
    }

    /* Breadcrumb */
    .breadcrumb {
      padding: 20px 0;
    }

    .breadcrumb-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #6b7280;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .breadcrumb-link:hover {
      color: #2a76d2;
      transform: translateX(4px);
    }

    .breadcrumb-link svg {
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
    }

    /* Loading State */
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .loading-spinner {
      text-align: center;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e5e7eb;
      border-top: 4px solid #2a76d2;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Error State */
    .error {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .error-content {
      text-align: center;
      max-width: 500px;
      background: rgba(255, 255, 255, 0.9);
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .error-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .error-content h3 {
      margin: 0 0 12px;
      color: #ef4444;
      font-size: 24px;
      font-weight: 700;
    }

    .error-content p {
      margin: 0 0 24px;
      color: #6b7280;
      line-height: 1.6;
    }

    .retry-btn {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .retry-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
    }

    /* Video Content */
    .video-content {
      padding: 0 0 60px;
    }

    .video-header {
      padding: 40px 0 30px;
      text-align: center;
    }

    .video-title {
      font-size: 2.5rem;
      font-weight: 800;
      color: #1f2937;
      margin: 0 0 20px;
      line-height: 1.2;
    }

    .video-meta {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(42, 118, 210, 0.1);
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 500;
      color: #2a76d2;
    }

    .meta-dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #c8d0d8;
    }

    .meta-item svg {
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
    }

    /* Video Player */
    .video-player-section {
      margin-bottom: 40px;
    }

    .video-container {
      background: #000;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      position: relative;
    }

    .video-wrapper {
      position: relative;
      width: 100%;
      height: 0;
      padding-bottom: 56.25%; /* 16:9 aspect ratio */
    }

    .video-player {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
      outline: none;
    }

    .embed-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .embed-player {
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 12px;
    }

    .video-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }

    .video-loading {
      text-align: center;
      color: white;
    }

    .video-loading .spinner {
      border-color: rgba(255, 255, 255, 0.3);
      border-top-color: white;
    }

    /* No Video State */
    .no-video-content {
      padding: 60px 40px;
      text-align: center;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    }

    .no-video-icon {
      font-size: 64px;
      margin-bottom: 20px;
      opacity: 0.7;
    }

    .no-video-content h3 {
      margin: 0 0 12px;
      color: #6b7280;
      font-size: 24px;
      font-weight: 700;
    }

    .no-video-content p {
      margin: 0 0 24px;
      color: #9ca3af;
      line-height: 1.6;
    }

    .video-debug {
      margin-top: 24px;
      text-align: left;
    }

    .video-debug details {
      background: rgba(255, 255, 255, 0.8);
      border-radius: 12px;
      padding: 16px;
    }

    .video-debug summary {
      cursor: pointer;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 12px;
    }

    .json {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      max-height: 300px;
      overflow: auto;
      font-size: 12px;
      color: #374151;
      border: 1px solid #e5e7eb;
    }

    /* Video Details */
    .video-details {
      margin-bottom: 40px;
    }

    .details-card {
      background: rgba(255, 255, 255, 0.9);
      padding: 30px;
      border-radius: 20px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(42, 118, 210, 0.1);
    }

    .details-card h3 {
      margin: 0 0 16px;
      color: #1f2937;
      font-size: 24px;
      font-weight: 700;
    }

    .video-description {
      margin: 0;
      color: #6b7280;
      line-height: 1.8;
      font-size: 16px;
    }

    /* Related Videos */
    .related-videos {
      margin-bottom: 40px;
    }

    .related-videos h3 {
      margin: 0 0 24px;
      color: #1f2937;
      font-size: 24px;
      font-weight: 700;
    }

    .related-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .related-card {
      background: rgba(255, 255, 255, 0.9);
      border-radius: 16px;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    }

    .related-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 25px rgba(42, 118, 210, 0.15);
    }

    .related-thumbnail {
      height: 160px;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .play-icon {
      background: rgba(42, 118, 210, 0.9);
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition: all 0.3s ease;
    }

    .related-card:hover .play-icon {
      background: #2a76d2;
      transform: scale(1.1);
    }

    .play-icon svg {
      fill: currentColor;
      margin-left: 2px;
    }

    .related-info {
      padding: 16px;
    }

    .related-info h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      line-height: 1.4;
    }

    /* Not Found State */
    .not-found {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .not-found-content {
      text-align: center;
      max-width: 500px;
      background: rgba(255, 255, 255, 0.9);
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(42, 118, 210, 0.1);
    }

    .not-found-icon {
      font-size: 64px;
      margin-bottom: 20px;
      opacity: 0.7;
    }

    .not-found-content h3 {
      margin: 0 0 16px;
      font-size: 24px;
      color: #2a76d2;
      font-weight: 700;
    }

    .not-found-content p {
      margin: 0 0 24px;
      color: #5b6773;
      line-height: 1.6;
      font-size: 16px;
    }

    .back-btn {
      background: linear-gradient(135deg, #2a76d2, #1e5bb8);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 14px;
      text-decoration: none;
      display: inline-block;
    }

    .back-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(42, 118, 210, 0.3);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .video-title {
        font-size: 2rem;
      }
      
      .video-meta {
        flex-direction: column;
        gap: 12px;
      }
      
      .related-grid {
        grid-template-columns: 1fr;
      }
      
      .details-card {
        padding: 20px;
      }
    }
  `]
})
export class VideoViewComponent implements OnInit, OnDestroy {
  id: string | null = null;
  item: any = null;
  loading = false;
  error: string | null = null;
  videoUrl: string | null = null; // object URL or direct URL
  videoLoading = false;
  relatedVideos: any[] = [];
  safeEmbedUrl: SafeResourceUrl | null = null;
  
  // Helper function to get embed URL
  getEmbedUrl(url: string): string {
    if (!url) return '';
    try {
      const u = new URL(url);
      // YouTube
      if (u.hostname.includes('youtube.com')) {
        const id = u.searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}` : '';
      }
      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.replace('/', '');
        return id ? `https://www.youtube.com/embed/${id}` : '';
      }
      // Vimeo
      if (u.hostname.includes('vimeo.com')) {
        const id = u.pathname.split('/').filter(Boolean)[0];
        return id ? `https://player.vimeo.com/video/${id}` : '';
      }
      // Direct mp4 or others
      return url;
    } catch {
      return url;
    }
  }

  constructor(
    private route: ActivatedRoute, 
    private api: ApiService,
    private sanitizer: DomSanitizer
  ){}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.fetch(this.id);
    }
  }

  ngOnDestroy(): void {
    if (this.videoUrl && this.videoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.videoUrl);
    }
  }

  fetch(id: string) {
    this.loading = true;
    this.error = null;
    this.api.getProgramsContentDetailById(id).subscribe({
      next: res => {
        this.item = res || null;
        this.loading = false;
        this.resolveVideo(this.item);
      },
      error: err => {
        this.error = err?.message || 'خطأ غير متوقع';
        this.loading = false;
      }
    });
  }

  private resolveVideo(item: any) {
    // Try common field names for a URL coming from API
    const direct = item?.SessionVideo || item?.sessionVideo || item?.VideoUrl || item?.Url || item?.MediaUrl || null;
    if (direct) {
      this.videoUrl = direct;
      // Create safe embed URL for iframe
      const embedUrl = this.getEmbedUrl(direct);
      if (embedUrl && embedUrl.startsWith('http') && (embedUrl.includes('youtube.com') || embedUrl.includes('player.vimeo.com'))) {
        this.safeEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
      } else {
        this.safeEmbedUrl = null;
      }
      return;
    }
    // If the API stores a blob/file id to fetch, try known endpoints via ApiService
    // Example keys (adjust as your backend dictates): 'ScientificMaterialFile' or similar
    // Here we attempt to fetch 'material' if present
    if (this.id) {
      try {
        this.api.getProgramsContentDetailMaterial(this.id).subscribe({
          next: blob => {
            const url = URL.createObjectURL(blob);
            this.videoUrl = url;
            this.safeEmbedUrl = null; // Direct video, no embed needed
          },
          error: _ => {
            // keep JSON fallback
          }
        });
      } catch {
        // ignore
      }
    }
  }

  retry() {
    if (this.id) {
      this.fetch(this.id);
    }
  }

  onVideoLoadStart() {
    this.videoLoading = true;
  }

  onVideoCanPlay() {
    this.videoLoading = false;
  }

  onVideoError(event: any) {
    this.videoLoading = false;
    console.error('Video error:', event);
  }
}
