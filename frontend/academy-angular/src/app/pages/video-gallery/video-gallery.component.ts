import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-video-gallery',
  template: `
    <section class="videos-page" dir="rtl">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">{{ 'videos_hero_title' | t }}</h1>
            <p class="hero-subtitle">{{ 'videos_hero_subtitle' | t }}</p>
          </div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="toolbar container">
        <div class="search-box">
          <input type="text" [(ngModel)]="q" (keydown.enter)="applyFilter()" [placeholder]="'search_video' | t" [attr.aria-label]="('search' | t)"/>
          <button class="search-btn" type="button" (click)="applyFilter()">{{ 'search' | t }}</button>
        </div>
        
        <!-- Admin Controls -->
        <div class="admin-controls" *ngIf="isAdmin">
          <a routerLink="/upload" class="upload-btn">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 5v14M5 12h14"/></svg>
            {{ 'upload_new_video' | t }}
          </a>
        </div>
        
        <div class="view-toggle" role="group" [attr.aria-label]="('search' | t)">
          <button [class.active]="view==='grid'" (click)="view='grid'" [attr.aria-label]="('view_grid' | t)">
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z"/></svg>
          </button>
          <button [class.active]="view==='list'" (click)="view='list'" [attr.aria-label]="('view_list' | t)">
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="container loading">{{ 'loading_plain' | t }}</div>
      <div *ngIf="error" class="container error">{{ error }}</div>

      <!-- No Videos Message -->
      <div *ngIf="!loading && !error && paged?.length === 0" class="container no-videos">
        <div class="no-videos-content">
          <div class="no-videos-icon">🎥</div>
          <h3>{{ 'no_videos_title' | t }}</h3>
          <p>{{ 'no_videos_desc' | t }}</p>
          <button class="refresh-btn" (click)="fetch()">{{ 'refresh_page' | t }}</button>
        </div>
      </div>

      <!-- Videos Grid -->
      <div class="videos container" [class.list]="view==='list'" *ngIf="!loading && !error && paged?.length > 0">
        <article class="video-card" *ngFor="let v of paged">
          <div class="card-media">
            <div class="video-thumbnail" [style.background-image]="getVideoThumbnail(v)">
              <div class="thumbnail-placeholder" *ngIf="!getVideoThumbnail(v)">
                <svg viewBox="0 0 24 24" width="48" height="48"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
            <div class="play-overlay">
              <div class="play-button">
                <svg viewBox="0 0 24 24" width="32" height="32"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
            <div class="video-duration" *ngIf="v.duration">15:30</div>
          </div>
          <div class="card-body">
            <h3 class="title" *ngIf="getVideoTitle(v)">{{ getVideoTitle(v) }}</h3>
            <p class="description" *ngIf="getVideoDescription(v)">{{ getVideoDescription(v) }}</p>
            <div class="meta">
              <span class="meta-item">
                <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                {{ 'educational' | t }}
              </span>
              <span class="meta-dot"></span>
              <span class="meta-item">
                <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                {{ 'available' | t }}
              </span>
            </div>
            <div *ngIf="isAdmin" style="margin: 8px 0; color: #6b7280; font-size: 12px; font-weight: 600;">
              {{ 'video_id' | t }} {{ v?.Id || v?.id }}
            </div>
            <div class="card-actions">
              <a class="watch-btn" [routerLink]="['/video', v?.Id || v?.id]">{{ 'watch_video' | t }}</a>
              
              <!-- Admin Actions -->
              <div class="admin-actions" *ngIf="isAdmin">
                <button class="edit-btn" (click)="openEdit(v)" [title]="'edit_video' | t">
                  <svg viewBox="0 0 24 24" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="delete-btn" (click)="deleteItem(v)" [title]="'delete_video' | t">
                  <svg viewBox="0 0 24 24" width="16" height="16"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- Pagination Controls -->
      <div class="container" *ngIf="!loading && !error && total > pageSize" style="display:flex;gap:8px;justify-content:center;align-items:center;margin:16px 0;">
          <button (click)="prevPage()" [disabled]="page<=1">{{ 'prev' | t }}</button>
          <span>{{ ('page_of' | t).replace('{{page}}', page) .replace('{{total}}', totalPages) }}</span>
          <button (click)="nextPage()" [disabled]="page>=totalPages">{{ 'next' | t }}</button>
      </div>

      <!-- Edit Modal -->
      <div class="modal-overlay" *ngIf="editing" (click)="cancelEdit()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ 'edit_video_modal_title' | t }}</h3>
            <button class="close-btn" (click)="cancelEdit()">×</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveEdit()">
              <div class="form-group">
                <label for="sessionVideo">{{ 'video_url_req' | t }}</label>
                <input 
                  type="url" 
                  id="sessionVideo" 
                  [(ngModel)]="editForm.SessionVideo" 
                  name="sessionVideo" 
                  required 
                  [placeholder]="'enter_youtube_vimeo' | t">
                <small>{{ 'video_url_hint' | t }}</small>
              </div>
              
              <div class="form-group">
                <label for="description">{{ 'video_desc' | t }}</label>
                <textarea 
                  id="description" 
                  [(ngModel)]="editForm.Description" 
                  name="description" 
                  rows="4" 
                  placeholder="اكتب وصفاً للفيديو...">
                </textarea>
              </div>
              
              <div class="form-group">
                <label for="programsContentMasterId">{{ 'choose_main_program_req' | t }}</label>
                <select 
                  id="programsContentMasterId" 
                  [(ngModel)]="editForm.ProgramsContentMasterId" 
                  name="programsContentMasterId" 
                  required>
                  <option value="">{{ 'choose_main_program_opt' | t }} ({{ masters.length }})</option>
                  <option *ngFor="let master of masters" [value]="master.id || master.Id">
                    {{ master.SessionNameL1 || master.sessionNameL1 || master.SessionNameL2 || master.sessionNameL2 || master.Description || 'برنامج غير معروف' }}
                  </option>
                </select>
                <small *ngIf="masters.length === 0" style="color: black;">{{ 'no_main_programs' | t }}</small>
              </div>
              
              <div class="form-actions">
                <button type="button" class="cancel-btn" (click)="cancelEdit()">{{ 'cancel_btn' | t }}</button>
                <button type="submit" class="submit-btn" [disabled]="saving">
                  {{ saving ? ('saving' | t) : ('save_changes_btn' | t) }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .videos-page { 
      padding: 0 0 80px; 
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      min-height: 100vh;
      position: relative;
      overflow: hidden;
    }

    .videos-page::before {
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
      max-width: 1400px; 
      width: 98%; 
      margin-inline: auto; 
      position: relative;
      z-index: 1;
    }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, #2a76d2 0%, #4A90E2 100%);
      padding: 80px 0;
      text-align: center;
      color: white;
      position: relative;
      overflow: hidden;
    }

    .hero-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="hero-dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255, 255, 255, 0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23hero-dots)"/></svg>');
    }

    .hero-content {
      position: relative;
      z-index: 1;
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 800;
      margin: 0 0 20px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .hero-subtitle {
      font-size: 1.25rem;
      opacity: 0.9;
      margin: 0;
      font-weight: 400;
    }

    /* Toolbar */
    .toolbar { 
      display: flex; 
      gap: 20px; 
      align-items: center; 
      justify-content: space-between; 
      margin: -40px auto 30px;
      background: rgba(255, 255, 255, 0.95);
      padding: 20px;
      border-radius: 20px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(42, 118, 210, 0.1);
    }

    .search-box { 
      display: flex; 
      gap: 12px; 
      align-items: center; 
      flex: 1; 
    }

    .search-box input { 
      flex: 1; 
      padding: 16px 20px; 
      border-radius: 25px; 
      border: 2px solid #e9ecef; 
      background: rgba(255, 255, 255, 0.9); 
      font-size: 15px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .search-box input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(42, 118, 210, 0.15);
      background: #fff;
      transform: translateY(-1px);
    }

    .search-box .search-btn { 
      min-width: 140px; 
      padding: 16px 24px; 
      border-radius: 25px; 
      border: none; 
      background: linear-gradient(135deg, #2a76d2, #4A90E2); 
      color: #fff; 
      font-weight: 700; 
      box-shadow: 0 6px 20px rgba(42, 118, 210, 0.3); 
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 15px;
      flex-shrink: 0;
    }

    .search-box .search-btn:hover { 
      background: linear-gradient(135deg, #1e3c72, #357ABD);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(42, 118, 210, 0.4);
    }

    .view-toggle { 
      display: inline-flex; 
      gap: 10px; 
      background: rgba(42, 118, 210, 0.05);
      padding: 4px;
      border-radius: 15px;
    }

    .view-toggle button { 
      width: 44px; 
      height: 44px; 
      border-radius: 12px; 
      border: none; 
      background: transparent; 
      display: grid; 
      place-items: center; 
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .view-toggle button:hover {
      background: rgba(42, 118, 210, 0.1);
    }

    .view-toggle button.active { 
      background: var(--primary); 
      box-shadow: 0 4px 15px rgba(42, 118, 210, 0.3);
    }

    .view-toggle button.active svg { 
      stroke: #fff; 
      fill: none; 
    }

    .view-toggle svg { 
      stroke: #6b7280; 
      fill: none; 
      stroke-width: 2; 
      transition: all 0.3s ease;
    }

    /* Admin Controls */
    .admin-controls {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .upload-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border: none;
      border-radius: 25px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
      text-decoration: none;
    }

    .upload-btn:hover {
      background: linear-gradient(135deg, #059669, #047857);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }

    .upload-btn svg {
      stroke: #fff;
      fill: none;
      stroke-width: 2;
    }

    /* Videos Grid */
    .videos { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); 
      gap: 30px; 
    }

    .videos.list { 
      grid-template-columns: 1fr; 
    }

    .video-card { 
      position: relative; 
      border: 1px solid rgba(42, 118, 210, 0.1); 
      border-radius: 20px; 
      background: #fff; 
      overflow: hidden; 
      box-shadow: 0 8px 25px rgba(0,0,0,0.08); 
      display: grid; 
      grid-template-rows: auto 1fr;
      transition: all 0.3s ease;
    }

    .video-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(42, 118, 210, 0.15);
    }

    .video-card:hover .video-thumbnail {
      transform: scale(1.05);
    }

    .videos.list .video-card { 
      grid-template-columns: 350px 1fr; 
      grid-template-rows: auto; 
    }

    .card-media { 
      position: relative; 
      overflow: hidden; 
    }

    .video-thumbnail {
      width: 100%; 
      height: 220px; 
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .videos.list .video-thumbnail { 
      height: 100%; 
      min-height: 220px; 
    }

    .thumbnail-placeholder {
      color: #6b7280;
      opacity: 0.5;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
    }

    .play-overlay { 
      position: absolute; 
      inset: 0; 
      display: grid; 
      place-items: center;
      background: rgba(0, 0, 0, 0.3);
      opacity: 0;
      transition: all 0.3s ease;
    }

    .video-card:hover .play-overlay {
      opacity: 1;
    }

    .play-button { 
      background: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      width: 80px;
      height: 80px;
      display: grid;
      place-items: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
    }

    .play-button:hover {
      background: #fff;
      transform: scale(1.1);
    }

    .play-button svg { 
      fill: #2a76d2; 
      margin-left: 4px;
    }

    .video-duration {
      position: absolute;
      bottom: 12px;
      right: 12px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
    }

    .card-body { 
      padding: 24px; 
    }

    .title { 
      margin: 0 0 12px; 
      font-size: 18px; 
      color: var(--text);
      font-weight: 600;
      line-height: 1.4;
    }

    .description { 
      margin: 0 0 16px; 
      color: #2d3748; 
      font-size: 16px;
      line-height: 1.7;
      background: rgba(42, 118, 210, 0.05);
      padding: 16px 20px;
      border-radius: 12px;
      border-left: 4px solid rgba(42, 118, 210, 0.3);
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(42, 118, 210, 0.1);
    }

    .meta { 
      display: flex; 
      align-items: center; 
      gap: 12px; 
      color: #6b7280; 
      font-size: 14px; 
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .meta-item { 
      display: inline-flex; 
      align-items: center; 
      gap: 6px;
      background: rgba(42, 118, 210, 0.05);
      padding: 6px 12px;
      border-radius: 15px;
      font-weight: 500;
    }

    .meta-dot { 
      width: 4px; 
      height: 4px; 
      border-radius: 50%; 
      background: #c8d0d8; 
    }

    .meta svg { 
      stroke: var(--primary); 
      fill: none; 
      stroke-width: 2; 
      width: 16px;
      height: 16px;
    }

    .watch-btn { 
      width: 100%; 
      padding: 16px 24px; 
      border: none; 
      border-radius: 25px; 
      background: linear-gradient(135deg, #2a76d2, #4A90E2); 
      color: #fff; 
      font-weight: 700; 
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 15px;
      box-shadow: 0 6px 20px rgba(42, 118, 210, 0.3);
      text-decoration: none;
      display: block;
      text-align: center;
    }

    .watch-btn:hover { 
      background: linear-gradient(135deg, #1e3c72, #357ABD);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(42, 118, 210, 0.4);
    }

    /* Admin Actions */
    .admin-actions {
      display: flex;
      gap: 8px;
      justify-content: center;
      margin-top: 12px;
    }

    .edit-btn, .delete-btn {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .edit-btn {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    .edit-btn:hover {
      background: #3b82f6;
      color: #fff;
      transform: translateY(-2px);
    }

    .delete-btn {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .delete-btn:hover {
      background: #ef4444;
      color: #fff;
      transform: translateY(-2px);
    }

    .edit-btn svg, .delete-btn svg {
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: grid;
      place-items: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal {
      background: #fff;
      border-radius: 20px;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 0;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 24px;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 24px;
      color: var(--text);
      font-weight: 700;
    }

    .close-btn {
      width: 40px;
      height: 40px;
      border: none;
      background: rgba(107, 114, 128, 0.1);
      border-radius: 50%;
      display: grid;
      place-items: center;
      cursor: pointer;
      font-size: 24px;
      color: #6b7280;
      transition: all 0.3s ease;
    }

    .close-btn:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .modal-body {
      padding: 0 24px 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: var(--text);
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 15px;
      transition: all 0.3s ease;
      background: #fff;
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(42, 118, 210, 0.1);
    }

    .form-group textarea {
      resize: vertical;
      min-height: 100px;
    }

    .form-group small {
      display: block;
      margin-top: 4px;
      color: #6b7280;
      font-size: 13px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }

    .cancel-btn, .submit-btn {
      padding: 12px 24px;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 15px;
    }

    .cancel-btn {
      background: #f3f4f6;
      color: #6b7280;
    }

    .cancel-btn:hover {
      background: #e5e7eb;
      color: #374151;
    }

    .submit-btn {
      background: linear-gradient(135deg, #2a76d2, #4A90E2);
      color: #fff;
      box-shadow: 0 4px 15px rgba(42, 118, 210, 0.3);
    }

    .submit-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #1e3c72, #357ABD);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(42, 118, 210, 0.4);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    /* Loading and Error States */
    .loading, .error {
      text-align: center;
      padding: 40px 20px;
      font-size: 18px;
    }

    .error {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
      border-radius: 12px;
      margin: 20px auto;
    }

    /* No Videos State */
    .no-videos {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
      padding: 40px 20px;
    }

    .no-videos-content {
      text-align: center;
      max-width: 500px;
      background: rgba(255, 255, 255, 0.9);
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(42, 118, 210, 0.1);
    }

    .no-videos-icon {
      font-size: 64px;
      margin-bottom: 20px;
      opacity: 0.7;
    }

    .no-videos-content h3 {
      margin: 0 0 16px;
      font-size: 24px;
      color: #2a76d2;
      font-weight: 700;
    }

    .no-videos-content p {
      margin: 0 0 24px;
      color: #5b6773;
      line-height: 1.6;
      font-size: 16px;
    }

    .refresh-btn {
      background: linear-gradient(135deg, #2a76d2, #1e5bb8);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 14px;
    }

    .refresh-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(42, 118, 210, 0.3);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.5rem;
      }
      
      .toolbar { 
        flex-direction: column; 
        align-items: stretch; 
        gap: 16px;
        margin: -20px auto 30px;
      }
      
      .view-toggle { align-self: flex-end; }
      .admin-controls { justify-content: center; }
      
      .videos {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      
      .videos.list .video-card { 
        grid-template-columns: 1fr; 
        grid-template-rows: auto 1fr;
      }
      
      .modal {
        margin: 10px;
        max-height: calc(100vh - 20px);
      }
      
      .modal-header {
        padding: 20px 20px 0;
      }
      
      .modal-body {
        padding: 0 20px 20px;
      }
      
      .form-actions {
        flex-direction: column;
      }
      
      .cancel-btn, .submit-btn {
        width: 100%;
      }
    }
  `]
})
export class VideoGalleryComponent implements OnInit {
  items: any[] = [];
  filtered: any[] = [];
  loading = false;
  error: string | null = null;
  q = '';
  page = 1;
  pageSize = 12;
  view: 'grid' | 'list' = 'grid';
  
  // Hidden videos by Id
  private hiddenIds = new Set<string>([
    '5cc93950-7186-44b8-8059-08dddbf7d5ac',
    '8d141f19-d371-41df-805b-08dddbf7d5ac'
  ]);
  
  // Edit functionality
  editing: any = null;
  editForm = { SessionVideo: '', Description: '', ProgramsContentMasterId: '' };
  saving = false;
  masters: any[] = [];
  
  get total() { return this.filtered.length; }
  get totalPages() { return Math.max(1, Math.ceil(this.total / this.pageSize)); }
  get paged() {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    this.testApiConnection();
    this.fetch();
    this.loadMasters();
  }

  // Test API connection
  testApiConnection() {
    console.log('Testing API connection...');
    this.api.getProgramsContentDetail().subscribe({
      next: (res) => {
        console.log('✅ API connection successful:', res);
      },
      error: (err) => {
        console.error('❌ API connection failed:', err);
        if (err?.status === 404) {
          console.error('API endpoint not found. Check server configuration.');
        }
      }
    });
  }

  fetch() {
    this.loading = true;
    this.error = null;
    this.api.getProgramsContentDetail().subscribe({
      next: (res: any) => {
        const all = Array.isArray(res) ? res : (res?.details || []);
        let list = all;
        // Exclude hidden IDs
        list = list.filter((v: any) => {
          const id = String(v?.Id || v?.id || '').toLowerCase();
          return id && !this.hiddenIds.has(id);
        });
        if (this.auth.isStudent() && !this.auth.isAdmin()) {
          const aId = this.auth.getAcademyId();
          const bId = this.auth.getBranchId();
          if (aId || bId) {
            list = all.filter((v: any) => {
              const va = v?.academyDataId || v?.AcademyDataId || v?.academyId || v?.AcademyId;
              const vb = v?.branchCodeId || v?.BranchCodeId || v?.branchId || v?.BranchId;
              const matchA = aId ? String(va || '').toLowerCase() === String(aId).toLowerCase() : true;
              const matchB = bId ? String(vb || '').toLowerCase() === String(bId).toLowerCase() : true;
              return matchA && matchB;
            });
          }
        }
        this.items = list;
        this.applyFilter();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.message || 'خطأ غير متوقع';
        this.loading = false;
      }
    });
  }

  applyFilter() {
    const q = (this.q || '').toLowerCase().trim();
    let list = [...this.items];
    if (q) {
      list = list.filter(v => {
        const title = this.getVideoTitle(v).toLowerCase();
        const description = this.getVideoDescription(v).toLowerCase();
        return title.includes(q) || description.includes(q);
      });
    }
    this.filtered = list;
    this.page = 1;
  }

  nextPage(){ if (this.page < this.totalPages) this.page += 1; }
  prevPage(){ if (this.page > 1) this.page -= 1; }

  get isAdmin(): boolean { return this.auth.isAdmin(); }

  // Get clean video title without ID tags
  getVideoTitle(video: any): string {
    let title = video?.Title || video?.Name || '';
    
    // Remove ID tags like #7556363b-f721-4497-227e-08ddeddd9878
    if (title) {
      title = title.replace(/#[a-f0-9-]{36}/gi, '').trim();
      title = title.replace(/#[a-f0-9-]{8,}/gi, '').trim();
    }
    
    // If no title, return empty string (description will be the main content)
    return title || '';
  }

  // Get clean video description
  getVideoDescription(video: any): string {
    let description = video?.Description || video?.description || '';
    
    // Remove ID tags from description
    if (description) {
      description = description.replace(/#[a-f0-9-]{36}/gi, '').trim();
      description = description.replace(/#[a-f0-9-]{8,}/gi, '').trim();
    }
    
    return description;
  }

  // Get video thumbnail from URL
  getVideoThumbnail(video: any): string | null {
    const videoUrl = video?.SessionVideo || video?.sessionVideo || video?.VideoUrl || video?.Url || video?.MediaUrl || '';
    if (!videoUrl) return null;

    try {
      const url = new URL(videoUrl);
      
      // YouTube thumbnail
      if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        let videoId = '';
        if (url.hostname.includes('youtu.be')) {
          videoId = url.pathname.replace('/', '');
        } else if (url.hostname.includes('youtube.com')) {
          videoId = url.searchParams.get('v') || '';
        }
        
        if (videoId) {
          // Try different thumbnail qualities - maxresdefault first, then hqdefault, then default
          return `url('https://img.youtube.com/vi/${videoId}/maxresdefault.jpg')`;
        }
      }
      
      // Vimeo thumbnail (requires API call, using placeholder for now)
      if (url.hostname.includes('vimeo.com')) {
        const videoId = url.pathname.split('/').filter(Boolean)[0];
        if (videoId) {
          // For Vimeo, we would need to make an API call to get the thumbnail
          // For now, return null to show placeholder
          return null;
        }
      }
      
      // For direct video files, return null to show placeholder
      return null;
    } catch {
      return null;
    }
  }

  // Handle thumbnail load error
  onThumbnailError(event: any) {
    // Hide the background image and show placeholder
    event.target.style.backgroundImage = 'none';
  }

  // Load programs content masters for edit form
  loadMasters() {
    this.api.getProgramsContentMaster().subscribe({
      next: (res: any) => {
        const raw = res?.data ?? res;
        const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.items) ? raw.items : []);
        this.masters = list;
      },
      error: () => this.masters = []
    });
  }

  // Open edit modal
  openEdit(item: any) {
    const detectedMaster = item?.ProgramsContentMasterId || item?.programsContentMasterId || 
                          item?.ProgramsContentMaster?.Id || item?.programsContentMaster?.id || '';
    
    // Ensure we have a valid master ID
    let masterId = detectedMaster;
    if (!masterId && this.masters.length > 0) {
      masterId = this.masters[0]?.id || this.masters[0]?.Id || '';
    }
    
    this.editing = item;
    this.editForm = { 
      SessionVideo: item?.SessionVideo || item?.sessionVideo || '', 
      Description: item?.Description || item?.description || '', 
      ProgramsContentMasterId: masterId
    };
  }

  // Save edit
  saveEdit() {
    if (!this.editing) return;
    this.saving = true;
    
    // Validate required fields
    if (!this.editForm.SessionVideo || this.editForm.SessionVideo.trim() === '') {
      alert('يرجى إدخال رابط الفيديو');
      this.saving = false;
      return;
    }
    
    // Resolve selected vs original master id
    const originalMaster = this.editing?.ProgramsContentMasterId || this.editing?.programsContentMasterId || 
                          this.editing?.ProgramsContentMaster?.Id || this.editing?.programsContentMaster?.id || '';
    let selectedMaster = this.editForm.ProgramsContentMasterId || originalMaster;

    if (!selectedMaster) {
      alert('يرجى اختيار البرنامج الرئيسي');
      this.saving = false;
      return;
    }

    const validateMaster = (id: string): Promise<boolean> => {
      return new Promise((resolve) => {
        if (!id) return resolve(false);
        this.api.getProgramsContentMasterById(id).subscribe({
          next: _ => resolve(true),
          error: _ => resolve(false)
        });
      });
    };

    // Validate with backend, fallback to first available master
    validateMaster(selectedMaster).then(async (ok) => {
      if (!ok) {
        const fallbackId = this.masters[0]?.id || this.masters[0]?.Id || '';
        const fallbackOk = await validateMaster(fallbackId);
        if (fallbackOk) {
          selectedMaster = fallbackId;
          this.editForm.ProgramsContentMasterId = selectedMaster;
        } else {
          alert('المعرف المختار للبرنامج غير موجود. يرجى اختيار برنامج صالح من القائمة.');
          this.saving = false;
          return;
        }
      }

      // Build payload (plain object). Service constructs FormData.
      const newDetailPayload: any = {
        ProgramsContentMasterId: selectedMaster,
        SessionVideo: this.editForm.SessionVideo.trim(),
        Description: this.editForm.Description.trim()
      };

      // Always create then delete (match React page behavior)
      this.api.createProgramsContentDetail(newDetailPayload).subscribe({
        next: _ => {
          const oldId = this.editing.id || this.editing.Id;
          this.api.deleteProgramsContentDetail(oldId).subscribe({
            next: () => {
              this.editing = null;
              this.fetch();
              this.saving = false;
            },
            error: (delErr: any) => {
              const delBody = delErr && delErr.body ? String(delErr.body) : '';
              const isDeleteFileFailed = delErr && delErr.status === 400 && delBody.includes('Delete.FileFailed');
              if (isDeleteFileFailed) {
                this.api.updateProgramsContentDetail(oldId, {
                  SessionQuiz: new Blob([]),
                  SessionTasks: new Blob([]),
                  SessionProject: new Blob([]),
                  ScientificMaterial: new Blob([]),
                }).subscribe({
                  next: () => {
                    this.api.deleteProgramsContentDetail(oldId).subscribe({
                      next: () => {
                        this.editing = null;
                        this.fetch();
                        this.saving = false;
                      },
                      error: () => {
                        this.editing = null;
                        this.fetch();
                        this.saving = false;
                      }
                    });
                  },
                  error: () => {
                    this.editing = null;
                    this.fetch();
                    this.saving = false;
                  }
                });
              } else {
                alert('تعذر حفظ التعديلات. تحقق من وجود البرنامج الرئيسي المرتبط.');
                this.saving = false;
              }
            }
          });
        },
        error: (e: any) => {
          // Handle common server errors similar to React page
          if (e?.status === 404) {
            alert('خطأ في الخادم: لا يمكن العثور على API المطلوب. تحقق من اتصال الخادم.');
          } else if (e?.status === 500) {
            alert('خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.');
          } else {
            alert('تعذر حفظ التعديلات. تحقق من وجود البرنامج الرئيسي المرتبط.');
          }
          this.saving = false;
        }
      });
    });
  }

  // Fallback method: create new record and delete old one
  private createNewAndDeleteOld(updatePayload: FormData) {
    // Create new FormData for the create operation
    const createFormData = new FormData();
    createFormData.append('ProgramsContentMasterId', updatePayload.get('ProgramsContentMasterId') || '');
    createFormData.append('SessionVideo', updatePayload.get('SessionVideo') || '');
    createFormData.append('Description', updatePayload.get('Description') || '');
    
    // Add empty file fields for create operation
    createFormData.append('SessionTasksFile', '');
    createFormData.append('SessionProjectFile', '');
    createFormData.append('ScientificMaterialFile', '');
    createFormData.append('SessionQuiz', '');
    
    this.api.createProgramsContentDetail(createFormData).subscribe({
      next: () => {
        // Try to delete old record
        this.api.deleteProgramsContentDetail(this.editing.id || this.editing.Id).subscribe({
          next: () => {
            this.editing = null;
            this.fetch();
            this.saving = false;
          },
          error: (delErr: any) => {
            // Handle delete file failed error
            const delBody = delErr && delErr.body ? String(delErr.body) : '';
            const isDeleteFileFailed = delErr && delErr.status === 400 && delBody.includes('Delete.FileFailed');
            
            if (isDeleteFileFailed) {
              // Try to clear files and delete again
              this.api.updateProgramsContentDetail(this.editing.id || this.editing.Id, { 
                SessionQuiz: new Blob([]),
                SessionTasks: new Blob([]),
                SessionProject: new Blob([]),
                ScientificMaterial: new Blob([]),
              }).subscribe({
                next: () => {
                  this.api.deleteProgramsContentDetail(this.editing.id || this.editing.Id).subscribe({
                    next: () => {
                      this.editing = null;
                      this.fetch();
                      this.saving = false;
                    },
                    error: () => {
                      this.editing = null;
                      this.fetch();
                      this.saving = false;
                    }
                  });
                },
                error: () => {
                  this.editing = null;
                  this.fetch();
                  this.saving = false;
                }
              });
            } else {
              this.editing = null;
              this.fetch();
              this.saving = false;
            }
          }
        });
      },
      error: (createErr: any) => {
        console.error('Create error:', createErr);
        
        // Check if it's a 404 error (endpoint not found)
        if (createErr?.status === 404) {
          alert('خطأ في الخادم: لا يمكن العثور على API المطلوب. تحقق من اتصال الخادم.');
          this.saving = false;
          return;
        }
        
        // Check if it's a 500 error (server error)
        if (createErr?.status === 500) {
          alert('خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.');
          this.saving = false;
          return;
        }
        
        alert('تعذر حفظ التعديلات. تحقق من وجود البرنامج الرئيسي المرتبط.');
        this.saving = false;
      }
    });
  }

  // Delete item
  deleteItem(item: any) {
    if (!confirm('تأكيد حذف هذا المحتوى؟')) return;
    
    this.api.deleteProgramsContentDetail(item.id || item.Id).subscribe({
      next: () => {
        this.fetch();
      },
      error: (e: any) => {
        const body = e && e.body ? String(e.body) : '';
        const isDeleteFileFailed = e && e.status === 400 && body.includes('Delete.FileFailed');
        
        if (isDeleteFileFailed) {
          // Try to clear files and delete again
          this.api.updateProgramsContentDetail(item.id || item.Id, {
            SessionQuiz: new Blob([]),
            SessionTasks: new Blob([]),
            SessionProject: new Blob([]),
            ScientificMaterial: new Blob([]),
          }).subscribe({
            next: () => {
              this.api.deleteProgramsContentDetail(item.id || item.Id).subscribe({
                next: () => this.fetch(),
                error: () => alert('تعذر الحذف')
              });
            },
            error: () => alert('تعذر الحذف')
          });
        } else {
          alert('تعذر الحذف');
        }
      }
    });
  }

  // Cancel edit
  cancelEdit() {
    this.editing = null;
    this.editForm = { SessionVideo: '', Description: '', ProgramsContentMasterId: '' };
  }
}
