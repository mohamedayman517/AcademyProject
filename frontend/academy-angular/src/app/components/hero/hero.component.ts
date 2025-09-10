import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LanguageService } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-hero',
  template: `
    <section #sectionRef class="hero-section" (mousemove)="handleMouseMove($event)">
      <div class="absolute inset-0 -z-10 animated-gradient opacity-90"></div>
      <div class="absolute inset-0 z-0 bg-black/55"></div>
      <div 
        class="pointer-events-none absolute inset-0 z-[1] mix-blend-screen hidden md:block"
        [style.background]="spotlight">
      </div>
      <div class="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl hidden md:block"></div>
      <div class="absolute -bottom-24 -right-24 w-80 h-80 bg-black/10 rounded-full blur-3xl hidden md:block"></div>
      
      <!-- جسيمات عائمة خفيفة -->
      <div class="pointer-events-none absolute inset-0 z-[1] hidden md:block">
        <span 
          *ngFor="let particle of particles; let i = index"
          class="absolute rounded-full bg-white/30 shadow-[0_0_8px_rgba(255,255,255,0.35)]"
          [class]="particle.size"
          [style.left]="particle.left"
          [style.top]="particle.top"
          [@float]="'in'"
          >
        </span>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 lg:py-28 relative z-10">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- المحتوى النصي -->
          <div 
            class="text-center lg:text-right text-white max-w-2xl mx-auto lg:mx-0"
            [@slideInUp]="'in'">
            <h1 class="text-3xl sm:text-4xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-[1.2] sm:leading-tight tracking-tight">
              {{ 'hero_title_line1' | t }}<br>{{ 'hero_title_line2' | t }}
            </h1>
            
            <p class="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed">
              {{ 'hero_desc' | t }}
            </p>

            <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-8 lg:mb-12">
              <div [@scaleHover]="'in'">
                <button 
                  (click)="onStart()" 
                  class="text-lg px-6 sm:px-8 py-3.5 sm:py-4 rounded-full shadow-lg shadow-black/20 focus-visible:ring-white/30 w-full sm:w-auto bg-white text-primary hover:bg-white/90 transition-all duration-300 font-semibold">
                  {{ 'hero_cta_start' | t }}
                  <svg class="mr-2 h-5 w-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                </button>
              </div>
              <div [@scaleHover]="'in'">
                <button 
                  (click)="onBrowse()" 
                  class="text-lg px-6 sm:px-8 py-3.5 sm:py-4 rounded-full border-2 border-white text-white bg-transparent hover:bg-white/10 hover:text-white focus-visible:ring-white/30 w-full sm:w-auto transition-all duration-300 font-semibold">
                  {{ 'hero_cta_browse' | t }}
                </button>
              </div>
            </div>

            <!-- الإحصائيات -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
              <div 
                *ngFor="let stat of stats; let index = index"
                class="text-center lg:text-start rounded-xl bg-white/5 p-3 sm:bg-transparent sm:p-0"
                [@slideInUp]="'in'"
                >
                <div class="flex items-center justify-center lg:justify-start mb-1.5 sm:mb-2">
                  <div class="p-1.5 sm:p-2 bg-white/15 rounded-lg">
                    <svg class="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path *ngIf="stat.icon === 'users'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      <path *ngIf="stat.icon === 'book'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                      <path *ngIf="stat.icon === 'award'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                      <path *ngIf="stat.icon === 'globe'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                    </svg>
                  </div>
                </div>
                <div class="text-xl sm:text-2xl font-bold text-white leading-none">{{ stat.value }}</div>
                <div class="text-xs sm:text-sm text-white/85 mt-0.5 sm:mt-1">{{ stat.label | t }}</div>
              </div>
            </div>
          </div>

          <!-- الصورة -->
          <div 
            class="relative mt-10 lg:mt-0"
            [@slideInRight]="'in'">
            <div class="relative z-10">
              <img 
                src="assets/images/hero_image-DNn0LS72.png" 
                [alt]="'hero_alt' | t"
                class="w-full h-auto rounded-3xl shadow-2xl border border-white/10"
                [@scaleHover]="'in'">
            </div>
            
            <!-- عناصر زخرفية -->
            <div class="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl hidden md:block"></div>
            <div class="absolute -bottom-4 -left-4 w-32 h-32 bg-white/10 rounded-full blur-xl hidden md:block"></div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-section {
      position: relative;
      overflow: hidden;
      min-height: 100vh;
      display: flex;
      align-items: center;
    }

    .animated-gradient {
      background: linear-gradient(120deg, #316591, #3E79AD, #69A2CF);
      background-size: 200% 200%;
      animation: gradientShift 10s ease infinite;
    }

    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .mix-blend-screen {
      mix-blend-mode: screen;
    }

    .bg-black\/55 {
      background-color: rgba(0, 0, 0, 0.55);
    }

    .bg-white\/10 {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .bg-white\/15 {
      background-color: rgba(255, 255, 255, 0.15);
    }

    .text-white\/90 {
      color: rgba(255, 255, 255, 0.9);
    }

    .text-white\/85 {
      color: rgba(255, 255, 255, 0.85);
    }

    .border-white\/10 {
      border-color: rgba(255, 255, 255, 0.1);
    }

    .border-white {
      border-color: white;
    }

    .shadow-\[0_0_8px_rgba\(255\,255\,255\,0\.35\)\] {
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.35);
    }

    .shadow-2xl {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .shadow-lg {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    .shadow-black\/20 {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
    }

    .focus-visible\:ring-white\/30:focus-visible {
      outline: 2px solid transparent;
      outline-offset: 2px;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
    }

    .hover\:bg-white\/10:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .hover\:bg-white\/90:hover {
      background-color: rgba(255, 255, 255, 0.9);
    }

    .hover\:text-white:hover {
      color: white;
    }

    .hover\:scale-105:hover {
      transform: scale(1.05);
    }

    .transition-all {
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }

    .transition-transform {
      transition-property: transform;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }

    .duration-300 {
      transition-duration: 300ms;
    }

    .font-extrabold {
      font-weight: 800;
    }

    .font-semibold {
      font-weight: 600;
    }

    .leading-\[1\.2\] {
      line-height: 1.2;
    }

    .leading-tight {
      line-height: 1.25;
    }

    .leading-relaxed {
      line-height: 1.625;
    }

    .leading-none {
      line-height: 1;
    }

    .tracking-tight {
      letter-spacing: -0.025em;
    }

    .rounded-3xl {
      border-radius: 1.5rem;
    }

    .rounded-xl {
      border-radius: 0.75rem;
    }

    .rounded-lg {
      border-radius: 0.5rem;
    }

    .rounded-full {
      border-radius: 9999px;
    }

    .blur-3xl {
      filter: blur(64px);
    }

    .blur-xl {
      filter: blur(24px);
    }

    .blur-lg {
      filter: blur(16px);
    }

    .pointer-events-none {
      pointer-events: none;
    }

    .absolute {
      position: absolute;
    }

    .relative {
      position: relative;
    }

    .inset-0 {
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }

    .-z-10 {
      z-index: -10;
    }

    .z-0 {
      z-index: 0;
    }

    .z-\[1\] {
      z-index: 1;
    }

    .z-10 {
      z-index: 10;
    }

    .-top-20 {
      top: -5rem;
    }

    .-left-20 {
      left: -5rem;
    }

    .-bottom-24 {
      bottom: -6rem;
    }

    .-right-24 {
      right: -6rem;
    }

    .-top-4 {
      top: -1rem;
    }

    .-right-4 {
      right: -1rem;
    }

    .-bottom-4 {
      bottom: -1rem;
    }

    .-left-4 {
      left: -1rem;
    }

    .w-72 {
      width: 18rem;
    }

    .h-72 {
      height: 18rem;
    }

    .w-80 {
      width: 20rem;
    }

    .h-80 {
      height: 20rem;
    }

    .w-24 {
      width: 6rem;
    }

    .h-24 {
      height: 6rem;
    }

    .w-32 {
      width: 8rem;
    }

    .h-32 {
      height: 8rem;
    }

    .w-2 {
      width: 0.5rem;
    }

    .h-2 {
      height: 0.5rem;
    }

    .w-1\.5 {
      width: 0.375rem;
    }

    .h-1\.5 {
      height: 0.375rem;
    }

    .w-5 {
      width: 1.25rem;
    }

    .h-5 {
      height: 1.25rem;
    }

    .w-6 {
      width: 1.5rem;
    }

    .h-6 {
      height: 1.5rem;
    }

    .max-w-7xl {
      max-width: 80rem;
    }

    .max-w-2xl {
      max-width: 42rem;
    }

    .mx-auto {
      margin-left: auto;
      margin-right: auto;
    }

    .px-4 {
      padding-left: 1rem;
      padding-right: 1rem;
    }

    .py-14 {
      padding-top: 3.5rem;
      padding-bottom: 3.5rem;
    }

    .py-3\.5 {
      padding-top: 0.875rem;
      padding-bottom: 0.875rem;
    }

    .px-6 {
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }

    .px-8 {
      padding-left: 2rem;
      padding-right: 2rem;
    }

    .py-4 {
      padding-top: 1rem;
      padding-bottom: 1rem;
    }

    .p-1\.5 {
      padding: 0.375rem;
    }

    .p-2 {
      padding: 0.5rem;
    }

    .p-3 {
      padding: 0.75rem;
    }

    .mb-4 {
      margin-bottom: 1rem;
    }

    .mb-6 {
      margin-bottom: 1.5rem;
    }

    .mb-8 {
      margin-bottom: 2rem;
    }

    .mb-12 {
      margin-bottom: 3rem;
    }

    .mb-1\.5 {
      margin-bottom: 0.375rem;
    }

    .mb-2 {
      margin-bottom: 0.5rem;
    }

    .mt-0\.5 {
      margin-top: 0.125rem;
    }

    .mt-1 {
      margin-top: 0.25rem;
    }

    .mt-10 {
      margin-top: 2.5rem;
    }

    .mr-2 {
      margin-right: 0.5rem;
    }

    .gap-3 {
      gap: 0.75rem;
    }

    .gap-4 {
      gap: 1rem;
    }

    .gap-6 {
      gap: 1.5rem;
    }

    .gap-12 {
      gap: 3rem;
    }

    .grid {
      display: grid;
    }

    .grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .grid-cols-4 {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .lg\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .lg\:grid-cols-4 {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .items-center {
      align-items: center;
    }

    .text-center {
      text-align: center;
    }

    .text-right {
      text-align: right;
    }

    .lg\:text-right {
      text-align: right;
    }

    .lg\:text-start {
      text-align: left;
    }

    .text-3xl {
      font-size: 1.875rem;
      line-height: 2.25rem;
    }

    .text-4xl {
      font-size: 2.25rem;
      line-height: 2.5rem;
    }

    .text-6xl {
      font-size: 3.75rem;
      line-height: 1;
    }

    .text-base {
      font-size: 1rem;
      line-height: 1.5rem;
    }

    .text-lg {
      font-size: 1.125rem;
      line-height: 1.75rem;
    }

    .text-xl {
      font-size: 1.25rem;
      line-height: 1.75rem;
    }

    .text-2xl {
      font-size: 1.5rem;
      line-height: 2rem;
    }

    .text-xs {
      font-size: 0.75rem;
      line-height: 1rem;
    }

    .text-sm {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    .text-white {
      color: white;
    }

    .text-primary {
      color: #316591;
    }

    .flex {
      display: flex;
    }

    .flex-col {
      flex-direction: column;
    }

    .justify-center {
      justify-content: center;
    }

    .justify-start {
      justify-content: flex-start;
    }

    .lg\:justify-start {
      justify-content: flex-start;
    }

    .lg\:justify-end {
      justify-content: flex-end;
    }

    .w-full {
      width: 100%;
    }

    .w-auto {
      width: auto;
    }

    .sm\:w-auto {
      width: auto;
    }

    .h-auto {
      height: auto;
    }

    .hidden {
      display: none;
    }

    .md\:block {
      display: block;
    }

    .sm\:px-6 {
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }

    .sm\:px-8 {
      padding-left: 2rem;
      padding-right: 2rem;
    }

    .sm\:py-4 {
      padding-top: 1rem;
      padding-bottom: 1rem;
    }

    .sm\:mb-6 {
      margin-bottom: 1.5rem;
    }

    .sm\:mb-8 {
      margin-bottom: 2rem;
    }

    .sm\:text-4xl {
      font-size: 2.25rem;
      line-height: 2.5rem;
    }

    .sm\:text-lg {
      font-size: 1.125rem;
      line-height: 1.75rem;
    }

    .sm\:text-xl {
      font-size: 1.25rem;
      line-height: 1.75rem;
    }

    .sm\:text-2xl {
      font-size: 1.5rem;
      line-height: 2rem;
    }

    .sm\:text-sm {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    .sm\:bg-transparent {
      background-color: transparent;
    }

    .sm\:p-0 {
      padding: 0;
    }

    .sm\:mb-2 {
      margin-bottom: 0.5rem;
    }

    .sm\:h-6 {
      height: 1.5rem;
    }

    .sm\:w-6 {
      width: 1.5rem;
    }

    .sm\:flex-row {
      flex-direction: row;
    }

    .sm\:gap-4 {
      gap: 1rem;
    }

    .lg\:px-8 {
      padding-left: 2rem;
      padding-right: 2rem;
    }

    .lg\:py-20 {
      padding-top: 5rem;
      padding-bottom: 5rem;
    }

    .lg\:py-28 {
      padding-top: 7rem;
      padding-bottom: 7rem;
    }

    .lg\:text-6xl {
      font-size: 3.75rem;
      line-height: 1;
    }

    .lg\:text-xl {
      font-size: 1.25rem;
      line-height: 1.75rem;
    }

    .lg\:text-right {
      text-align: right;
    }

    .lg\:text-start {
      text-align: left;
    }

    .lg\:justify-start {
      justify-content: flex-start;
    }

    .lg\:justify-end {
      justify-content: flex-end;
    }

    .lg\:mt-0 {
      margin-top: 0;
    }

    .lg\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .lg\:grid-cols-4 {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .lg\:mx-0 {
      margin-left: 0;
      margin-right: 0;
    }

    .lg\:mb-12 {
      margin-bottom: 3rem;
    }

    .lg\:px-8 {
      padding-left: 2rem;
      padding-right: 2rem;
    }

    .lg\:py-20 {
      padding-top: 5rem;
      padding-bottom: 5rem;
    }

    .lg\:py-28 {
      padding-top: 7rem;
      padding-bottom: 7rem;
    }

    .lg\:text-6xl {
      font-size: 3.75rem;
      line-height: 1;
    }

    .lg\:text-xl {
      font-size: 1.25rem;
      line-height: 1.75rem;
    }

    .lg\:text-right {
      text-align: right;
    }

    .lg\:text-start {
      text-align: left;
    }

    .lg\:justify-start {
      justify-content: flex-start;
    }

    .lg\:justify-end {
      justify-content: flex-end;
    }

    .lg\:mt-0 {
      margin-top: 0;
    }

    .lg\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .lg\:grid-cols-4 {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .lg\:mx-0 {
      margin-left: 0;
      margin-right: 0;
    }

    .lg\:mb-12 {
      margin-bottom: 3rem;
    }

    .inline {
      display: inline;
    }

    .opacity-90 {
      opacity: 0.9;
    }

    .opacity-55 {
      opacity: 0.55;
    }

    .opacity-30 {
      opacity: 0.3;
    }

    .opacity-15 {
      opacity: 0.15;
    }

    .opacity-10 {
      opacity: 0.1;
    }

    .opacity-5 {
      opacity: 0.05;
    }

    .opacity-0 {
      opacity: 0;
    }

    .border-2 {
      border-width: 2px;
    }

    .border {
      border-width: 1px;
    }

    .bg-transparent {
      background-color: transparent;
    }

    .bg-white {
      background-color: white;
    }

    .bg-primary {
      background-color: #316591;
    }

    .bg-white\/10 {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .bg-white\/15 {
      background-color: rgba(255, 255, 255, 0.15);
    }

    .bg-white\/20 {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .bg-white\/30 {
      background-color: rgba(255, 255, 255, 0.3);
    }

    .bg-white\/5 {
      background-color: rgba(255, 255, 255, 0.05);
    }

    .bg-black\/10 {
      background-color: rgba(0, 0, 0, 0.1);
    }

    .bg-black\/55 {
      background-color: rgba(0, 0, 0, 0.55);
    }

    .bg-white\/10 {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .bg-white\/15 {
      background-color: rgba(255, 255, 255, 0.15);
    }

    .bg-white\/20 {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .bg-white\/30 {
      background-color: rgba(255, 255, 255, 0.3);
    }

    .bg-white\/5 {
      background-color: rgba(255, 255, 255, 0.05);
    }

    .bg-black\/10 {
      background-color: rgba(0, 0, 0, 0.1);
    }

    .bg-black\/55 {
      background-color: rgba(0, 0, 0, 0.55);
    }

    .bg-white\/10 {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .bg-white\/15 {
      background-color: rgba(255, 255, 255, 0.15);
    }

    .bg-white\/20 {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .bg-white\/30 {
      background-color: rgba(255, 255, 255, 0.3);
    }

    .bg-white\/5 {
      background-color: rgba(255, 255, 255, 0.05);
    }

    .bg-black\/10 {
      background-color: rgba(0, 0, 0, 0.1);
    }

    .bg-black\/55 {
      background-color: rgba(0, 0, 0, 0.55);
    }

    .bg-white\/10 {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .bg-white\/15 {
      background-color: rgba(255, 255, 255, 0.15);
    }

    .bg-white\/20 {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .bg-white\/30 {
      background-color: rgba(255, 255, 255, 0.3);
    }

    .bg-white\/5 {
      background-color: rgba(255, 255, 255, 0.05);
    }

    .bg-black\/10 {
      background-color: rgba(0, 0, 0, 0.1);
    }

    .bg-black\/55 {
      background-color: rgba(0, 0, 0, 0.55);
    }

    .bg-white\/10 {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .bg-white\/15 {
      background-color: rgba(255, 255, 255, 0.15);
    }

    .bg-white\/20 {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .bg-white\/30 {
      background-color: rgba(255, 255, 255, 0.3);
    }

    .bg-white\/5 {
      background-color: rgba(255, 255, 255, 0.05);
    }

    .bg-black\/10 {
      background-color: rgba(0, 0, 0, 0.1);
    }

    .bg-black\/55 {
      background-color: rgba(0, 0, 0, 0.55);
    }

    .bg-white\/10 {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .bg-white\/15 {
      background-color: rgba(255, 255, 255, 0.15);
    }

    .bg-white\/20 {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .bg-white\/30 {
      background-color: rgba(255, 255, 255, 0.3);
    }

    .bg-white\/5 {
      background-color: rgba(255, 255, 255, 0.05);
    }

    .bg-black\/10 {
      background-color: rgba(0, 0, 0, 0.1);
    }

    .bg-black\/55 {
      background-color: rgba(0, 0, 0, 0.55);
    }

    .bg-white\/10 {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .bg-white\/15 {
      background-color: rgba(255, 255, 255, 0.15);
    }

    .bg-white\/20 {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .bg-white\/10 {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .bg-white\/5 {
      background-color: rgba(255, 255, 255, 0.05);
    }

    .bg-black\/55 {
      background-color: rgba(0, 0, 0, 0.55);
    }

    .bg-black\/10 {
      background-color: rgba(0, 0, 0, 0.1);
    }

    .rounded-3xl {
      border-radius: 1.5rem;
    }

    .rounded-xl {
      border-radius: 0.75rem;
    }

    .rounded-lg {
      border-radius: 0.5rem;
    }

    .rounded-full {
      border-radius: 9999px;
    }

    .shadow-2xl {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .shadow-lg {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    .shadow-black\/20 {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
    }

    .shadow-\[0_0_8px_rgba\(255,255,255,0\.35\)\] {
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.35);
    }

    .border-white\/10 {
      border-color: rgba(255, 255, 255, 0.1);
    }

    .border-white\/25 {
      border-color: rgba(255, 255, 255, 0.25);
    }

    .border-white\/40 {
      border-color: rgba(255, 255, 255, 0.4);
    }

    .border-2 {
      border-width: 2px;
    }

    .text-white {
      color: white;
    }

    .text-white\/90 {
      color: rgba(255, 255, 255, 0.9);
    }

    .text-white\/85 {
      color: rgba(255, 255, 255, 0.85);
    }

    .text-white\/70 {
      color: rgba(255, 255, 255, 0.7);
    }

    .text-white\/30 {
      color: rgba(255, 255, 255, 0.3);
    }

    .text-3xl {
      font-size: 1.875rem;
      line-height: 2.25rem;
    }

    .text-4xl {
      font-size: 2.25rem;
      line-height: 2.5rem;
    }

    .text-6xl {
      font-size: 3.75rem;
      line-height: 1;
    }

    .text-2xl {
      font-size: 1.5rem;
      line-height: 2rem;
    }

    .text-xl {
      font-size: 1.25rem;
      line-height: 1.75rem;
    }

    .text-lg {
      font-size: 1.125rem;
      line-height: 1.75rem;
    }

    .text-base {
      font-size: 1rem;
      line-height: 1.5rem;
    }

    .text-sm {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    .text-xs {
      font-size: 0.75rem;
      line-height: 1rem;
    }

    .font-extrabold {
      font-weight: 800;
    }

    .font-bold {
      font-weight: 700;
    }

    .font-semibold {
      font-weight: 600;
    }

    .font-medium {
      font-weight: 500;
    }

    .leading-tight {
      line-height: 1.25;
    }

    .leading-relaxed {
      line-height: 1.625;
    }

    .leading-none {
      line-height: 1;
    }

    .tracking-tight {
      letter-spacing: -0.025em;
    }

    .mb-4 {
      margin-bottom: 1rem;
    }

    .mb-6 {
      margin-bottom: 1.5rem;
    }

    .mb-8 {
      margin-bottom: 2rem;
    }

    .mb-12 {
      margin-bottom: 3rem;
    }

    .mb-1\.5 {
      margin-bottom: 0.375rem;
    }

    .mb-2 {
      margin-bottom: 0.5rem;
    }

    .mb-1 {
      margin-bottom: 0.25rem;
    }

    .mt-0\.5 {
      margin-top: 0.125rem;
    }

    .mt-1 {
      margin-top: 0.25rem;
    }

    .mt-10 {
      margin-top: 2.5rem;
    }

    .mr-2 {
      margin-right: 0.5rem;
    }

    .p-1\.5 {
      padding: 0.375rem;
    }

    .p-2 {
      padding: 0.5rem;
    }

    .p-3 {
      padding: 0.75rem;
    }

    .p-6 {
      padding: 1.5rem;
    }

    .p-8 {
      padding: 2rem;
    }

    .p-10 {
      padding: 2.5rem;
    }

    .px-4 {
      padding-left: 1rem;
      padding-right: 1rem;
    }

    .px-6 {
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }

    .px-8 {
      padding-left: 2rem;
      padding-right: 2rem;
    }

    .px-10 {
      padding-left: 2.5rem;
      padding-right: 2.5rem;
    }

    .py-3\.5 {
      padding-top: 0.875rem;
      padding-bottom: 0.875rem;
    }

    .py-4 {
      padding-top: 1rem;
      padding-bottom: 1rem;
    }

    .py-14 {
      padding-top: 3.5rem;
      padding-bottom: 3.5rem;
    }

    .py-20 {
      padding-top: 5rem;
      padding-bottom: 5rem;
    }

    .py-28 {
      padding-top: 7rem;
      padding-bottom: 7rem;
    }

    .w-2 {
      width: 0.5rem;
    }

    .w-1\.5 {
      width: 0.375rem;
    }

    .w-5 {
      width: 1.25rem;
    }

    .w-6 {
      width: 1.5rem;
    }

    .w-8 {
      width: 2rem;
    }

    .w-12 {
      width: 3rem;
    }

    .w-16 {
      width: 4rem;
    }

    .w-20 {
      width: 5rem;
    }

    .w-24 {
      width: 6rem;
    }

    .w-32 {
      width: 8rem;
    }

    .w-72 {
      width: 18rem;
    }

    .w-80 {
      width: 20rem;
    }

    .w-full {
      width: 100%;
    }

    .w-auto {
      width: auto;
    }

    .h-2 {
      height: 0.5rem;
    }

    .h-1\.5 {
      height: 0.375rem;
    }

    .h-5 {
      height: 1.25rem;
    }

    .h-6 {
      height: 1.5rem;
    }

    .h-8 {
      height: 2rem;
    }

    .h-12 {
      height: 3rem;
    }

    .h-16 {
      height: 4rem;
    }

    .h-20 {
      height: 5rem;
    }

    .h-24 {
      height: 6rem;
    }

    .h-32 {
      height: 8rem;
    }

    .h-72 {
      height: 18rem;
    }

    .h-80 {
      height: 20rem;
    }

    .h-auto {
      height: auto;
    }

    .h-full {
      height: 100%;
    }

    .max-w-2xl {
      max-width: 42rem;
    }

    .max-w-7xl {
      max-width: 80rem;
    }

    .mx-auto {
      margin-left: auto;
      margin-right: auto;
    }

    .mx-0 {
      margin-left: 0;
      margin-right: 0;
    }

    .flex {
      display: flex;
    }

    .flex-col {
      flex-direction: column;
    }

    .flex-1 {
      flex: 1 1 0%;
    }

    .items-center {
      align-items: center;
    }

    .items-start {
      align-items: flex-start;
    }

    .justify-center {
      justify-content: center;
    }

    .justify-start {
      justify-content: flex-start;
    }

    .justify-end {
      justify-content: flex-end;
    }

    .gap-2 {
      gap: 0.5rem;
    }

    .gap-3 {
      gap: 0.75rem;
    }

    .gap-4 {
      gap: 1rem;
    }

    .gap-6 {
      gap: 1.5rem;
    }

    .gap-8 {
      gap: 2rem;
    }

    .gap-12 {
      gap: 3rem;
    }

    .grid {
      display: grid;
    }

    .grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .grid-cols-4 {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .lg\\:grid-cols-2 {
      @media (min-width: 1024px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    .lg\\:grid-cols-4 {
      @media (min-width: 1024px) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }

    .lg\\:text-right {
      @media (min-width: 1024px) {
        text-align: right;
      }
    }

    .lg\\:text-start {
      @media (min-width: 1024px) {
        text-align: left;
      }
    }

    .lg\\:justify-start {
      @media (min-width: 1024px) {
        justify-content: flex-start;
      }
    }

    .lg\\:mx-0 {
      @media (min-width: 1024px) {
        margin-left: 0;
        margin-right: 0;
      }
    }

    .lg\\:mt-0 {
      @media (min-width: 1024px) {
        margin-top: 0;
      }
    }

    .text-center {
      text-align: center;
    }

    .text-start {
      text-align: left;
    }

    .text-right {
      text-align: right;
    }

    .relative {
      position: relative;
    }

    .absolute {
      position: absolute;
    }

    .inset-0 {
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }

    .-top-4 {
      top: -1rem;
    }

    .-top-20 {
      top: -5rem;
    }

    .-bottom-4 {
      bottom: -1rem;
    }

    .-bottom-24 {
      bottom: -6rem;
    }

    .-left-4 {
      left: -1rem;
    }

    .-left-20 {
      left: -5rem;
    }

    .-right-4 {
      right: -1rem;
    }

    .-right-24 {
      right: -6rem;
    }

    .z-0 {
      z-index: 0;
    }

    .z-1 {
      z-index: 1;
    }

    .z-10 {
      z-index: 10;
    }

    .z-\\[1\\] {
      z-index: 1;
    }

    .z-\\[10\\] {
      z-index: 10;
    }

    .overflow-hidden {
      overflow: hidden;
    }

    .isolate {
      isolation: isolate;
    }

    .pointer-events-none {
      pointer-events: none;
    }

    .hidden {
      display: none;
    }

    .md\\:block {
      @media (min-width: 768px) {
        display: block;
      }
    }

    .md\\:py-20 {
      @media (min-width: 768px) {
        padding-top: 5rem;
        padding-bottom: 5rem;
      }
    }

    .md\\:py-28 {
      @media (min-width: 768px) {
        padding-top: 7rem;
        padding-bottom: 7rem;
      }
    }

    .sm\\:px-6 {
      @media (min-width: 640px) {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
      }
    }

    .sm\\:px-8 {
      @media (min-width: 640px) {
        padding-left: 2rem;
        padding-right: 2rem;
      }
    }

    .sm\\:py-4 {
      @media (min-width: 640px) {
        padding-top: 1rem;
        padding-bottom: 1rem;
      }
    }

    .sm\\:text-4xl {
      @media (min-width: 640px) {
        font-size: 2.25rem;
        line-height: 2.5rem;
      }
    }

    .sm\\:text-lg {
      @media (min-width: 640px) {
        font-size: 1.125rem;
        line-height: 1.75rem;
      }
    }

    .sm\\:text-xl {
      @media (min-width: 640px) {
        font-size: 1.25rem;
        line-height: 1.75rem;
      }
    }

    .sm\\:text-2xl {
      @media (min-width: 640px) {
        font-size: 1.5rem;
        line-height: 2rem;
      }
    }

    .sm\\:mb-6 {
      @media (min-width: 640px) {
        margin-bottom: 1.5rem;
      }
    }

    .sm\\:mb-8 {
      @media (min-width: 640px) {
        margin-bottom: 2rem;
      }
    }

    .sm\\:px-6 {
      @media (min-width: 640px) {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
      }
    }

    .sm\\:px-8 {
      @media (min-width: 640px) {
        padding-left: 2rem;
        padding-right: 2rem;
      }
    }

    .sm\\:py-3\\.5 {
      @media (min-width: 640px) {
        padding-top: 0.875rem;
        padding-bottom: 0.875rem;
      }
    }

    .sm\\:py-4 {
      @media (min-width: 640px) {
        padding-top: 1rem;
        padding-bottom: 1rem;
      }
    }

    .sm\\:flex-row {
      @media (min-width: 640px) {
        flex-direction: row;
      }
    }

    .sm\\:w-auto {
      @media (min-width: 640px) {
        width: auto;
      }
    }

    .sm\\:justify-center {
      @media (min-width: 640px) {
        justify-content: center;
      }
    }

    .sm\\:bg-transparent {
      @media (min-width: 640px) {
        background-color: transparent;
      }
    }

    .sm\\:p-0 {
      @media (min-width: 640px) {
        padding: 0;
      }
    }

    .sm\\:mb-2 {
      @media (min-width: 640px) {
        margin-bottom: 0.5rem;
      }
    }

    .sm\\:h-6 {
      @media (min-width: 640px) {
        height: 1.5rem;
      }
    }

    .sm\\:w-6 {
      @media (min-width: 640px) {
        width: 1.5rem;
      }
    }

    .sm\\:text-sm {
      @media (min-width: 640px) {
        font-size: 0.875rem;
        line-height: 1.25rem;
      }
    }

    .sm\\:mt-1 {
      @media (min-width: 640px) {
        margin-top: 0.25rem;
      }
    }

    .lg\\:px-8 {
      @media (min-width: 1024px) {
        padding-left: 2rem;
        padding-right: 2rem;
      }
    }

    .lg\\:py-20 {
      @media (min-width: 1024px) {
        padding-top: 5rem;
        padding-bottom: 5rem;
      }
    }

    .lg\\:py-28 {
      @media (min-width: 1024px) {
        padding-top: 7rem;
        padding-bottom: 7rem;
      }
    }

    .lg\\:text-6xl {
      @media (min-width: 1024px) {
        font-size: 3.75rem;
        line-height: 1;
      }
    }

    .lg\\:text-right {
      @media (min-width: 1024px) {
        text-align: right;
      }
    }

    .lg\\:text-start {
      @media (min-width: 1024px) {
        text-align: left;
      }
    }

    .lg\\:justify-start {
      @media (min-width: 1024px) {
        justify-content: flex-start;
      }
    }

    .lg\\:mx-0 {
      @media (min-width: 1024px) {
        margin-left: 0;
        margin-right: 0;
      }
    }

    .lg\\:mt-0 {
      @media (min-width: 1024px) {
        margin-top: 0;
      }
    }

    .lg\\:mb-12 {
      @media (min-width: 1024px) {
        margin-bottom: 3rem;
      }
    }

    .lg\\:mb-6 {
      @media (min-width: 1024px) {
        margin-bottom: 1.5rem;
      }
    }

    .lg\\:grid-cols-2 {
      @media (min-width: 1024px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    .lg\\:grid-cols-4 {
      @media (min-width: 1024px) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }

    .focus-visible\\:ring-white\\/30:focus-visible {
      outline: 2px solid transparent;
      outline-offset: 2px;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
    }

    .hover\\:bg\\.white\\/10:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .hover\\:bg-white\\/10:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .hover\\:bg-white\\/20:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .hover\\:bg-white\\/30:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }

    .hover\\:text-white:hover {
      color: white;
    }

    .hover\\:scale-105:hover {
      transform: scale(1.05);
    }

    .hover\\:scale-110:hover {
      transform: scale(1.1);
    }

    .hover\\:shadow-xl:hover {
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .hover\\:shadow-2xl:hover {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .transition-all {
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }

    .duration-300 {
      transition-duration: 300ms;
    }

    .ease-in-out {
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }

    .ease-out {
      transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }

    .transform {
      transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
    }

    .scale-105 {
      --tw-scale-x: 1.05;
      --tw-scale-y: 1.05;
      transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
    }

    .scale-110 {
      --tw-scale-x: 1.1;
      --tw-scale-y: 1.1;
      transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
    }

    .scale-98 {
      --tw-scale-x: 0.98;
      --tw-scale-y: 0.98;
      transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
    }

    .scale-102 {
      --tw-scale-x: 1.02;
      --tw-scale-y: 1.02;
      transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
    }

    .mix-blend-screen {
      mix-blend-mode: screen;
    }

    .backdrop-blur-sm {
      backdrop-filter: blur(4px);
    }

    .backdrop-blur-xl {
      backdrop-filter: blur(24px);
    }

    .blur-3xl {
      filter: blur(64px);
    }

    .blur-xl {
      filter: blur(24px);
    }

    .blur-lg {
      filter: blur(16px);
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }

    @keyframes slideInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(30px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .hero-content {
        grid-template-columns: 1fr;
        gap: 40px;
        text-align: center;
        grid-template-areas:
          'image'
          'text';
      }
      
      .hero-section { 
        min-height: 600px; 
        padding: 60px 0 80px;
      }
      
      .hero-img { 
        height: clamp(400px, 50vh, 600px); 
        max-width: 500px;
      }
      
      .hero-title {
        font-size: 2.8rem;
      }
      
      .hero-description {
        font-size: 1.1rem;
      }
      
      .hero-buttons {
        justify-content: center;
      }
      
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
      }
    }

    @media (max-width: 768px) {
      .hero-section { 
        min-height: 500px; 
        padding: 40px 0 60px;
      }
      
      .hero-img { 
        height: clamp(300px, 40vh, 500px); 
        max-width: 400px;
      }
      
      .hero-title {
        font-size: 2.2rem;
        margin-bottom: 16px;
      }
      
      .hero-description {
        font-size: 1rem;
        margin-bottom: 24px;
      }
      
      .btn-primary,
      .btn-secondary {
        padding: 12px 24px;
        font-size: 0.95rem;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .stat-item {
        padding: 20px 16px;
      }
      
      .stat-icon {
        width: 50px;
        height: 50px;
      }
      
      .stat-number {
        font-size: 1.8rem;
      }
      
      .stat-label {
        font-size: 0.9rem;
      }
    }

    @media (max-width: 480px) {
      .hero-section {
        padding: 30px 0 50px;
      }
      
      .hero-title {
        font-size: 1.8rem;
      }
      
      .hero-description {
        font-size: 0.95rem;
      }
      
      .btn-primary,
      .btn-secondary {
        padding: 10px 20px;
        font-size: 0.9rem;
      }
      
      .hero-buttons {
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }
      
      .stats-section {
        padding: 40px 0;
      }
    }
  `],
  animations: [
    trigger('slideInUp', [
      state('in', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('void => *', [
        style({
          opacity: 0,
          transform: 'translateY(20px)'
        }),
        animate('0.7s ease-out')
      ])
    ]),
    trigger('slideInRight', [
      state('in', style({
        opacity: 1,
        transform: 'translateX(0) scale(1)'
      })),
      transition('void => *', [
        style({
          opacity: 0,
          transform: 'translateX(20px) scale(0.98)'
        }),
        animate('0.8s ease-out')
      ])
    ]),
    trigger('scaleHover', [
      state('in', style({
        transform: 'scale(1)'
      })),
      transition('* => *', [
        animate('0.3s ease')
      ])
    ]),
    trigger('float', [
      state('in', style({
        transform: 'translateY(0)',
        opacity: 0.7
      })),
      transition('void => *', [
        style({
          transform: 'translateY(0)',
          opacity: 0.7
        }),
        animate('6s ease-in-out', keyframes([
          style({ transform: 'translateY(0)', opacity: 0.5, offset: 0 }),
          style({ transform: 'translateY(-6px)', opacity: 0.9, offset: 0.5 }),
          style({ transform: 'translateY(6px)', opacity: 0.5, offset: 1 })
        ]))
      ])
    ])
  ]
})
export class HeroComponent implements OnInit {
  studentAcademy: string | null = null;
  studentBranch: string | null = null;
  isAuthenticated = false;
  currentLang = 'en';
  spotlight = '';
  particles: any[] = [];
  stats: any[] = [
    { icon: 'users', value: '50,000+', label: 'students_registered' },
    { icon: 'book', value: '300+', label: 'training_courses' },
    { icon: 'award', value: '1,000+', label: 'certified_count' },
    { icon: 'globe', value: '15+', label: 'countries' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.loadStudentData();
    this.checkAuthStatus();
    this.initializeLanguage();
    this.initializeParticles();
  }

  private loadStudentData(): void {
    try {
      // محاولة تحميل من userSocialMedia
      const storedSocialData = localStorage.getItem('userSocialMedia');
      if (storedSocialData) {
        const parsedData = JSON.parse(storedSocialData);
        if (parsedData.academyDataId) {
          this.studentAcademy = parsedData.academyDataId;
        }
        if (parsedData.branchesDataId) {
          this.studentBranch = parsedData.branchesDataId;
        }
      }
      
      // محاولة تحميل من studentData
      const studentDataFromStorage = localStorage.getItem('studentData');
      if (studentDataFromStorage) {
        const parsedStudentData = JSON.parse(studentDataFromStorage);
        if (parsedStudentData.academyDataId || parsedStudentData.AcademyDataId) {
          const academyId = parsedStudentData.academyDataId || parsedStudentData.AcademyDataId;
          this.studentAcademy = academyId;
        }
        if (parsedStudentData.branchesDataId || parsedStudentData.BranchesDataId) {
          const branchId = parsedStudentData.branchesDataId || parsedStudentData.BranchesDataId;
          this.studentBranch = branchId;
        }
      }
    } catch (error) {
      console.log('Error loading student data in Hero:', error);
    }
  }

  private checkAuthStatus(): void {
    this.authService.isAuthenticated$.subscribe((isAuth: boolean) => {
      this.isAuthenticated = isAuth;
    });
  }

  onBrowse(): void {
    // إذا كان الطالب لديه أكاديمية وفرع، وجهه للرابط مع المعاملات
    if (this.studentAcademy && this.studentBranch) {
      this.router.navigate(['/projects-master'], { 
        queryParams: { 
          academy: this.studentAcademy, 
          branch: this.studentBranch 
        } 
      });
    } else {
      // وإلا وجهه للصفحة العادية
      this.router.navigate(['/projects-master']);
    }
  }

  onStart(): void {
    if (this.isAuthenticated) {
      this.router.navigate(['/account']);
    } else {
      this.router.navigate(['/register']);
    }
  }

  getStartButtonText(): string {
    if (this.isAuthenticated) {
      return this.languageService.current === 'ar' ? 'حسابي' : 'My Account';
    }
    return this.languageService.current === 'ar' ? 'ابدأ الآن مجاناً' : 'Start now for free';
  }

  private initializeLanguage(): void {
    this.currentLang = this.languageService.current || 'en';
  }

  private initializeParticles(): void {
    // Initialize floating particles to match React version exactly
    this.particles = [
      { left: '12%', top: '18%', size: 'w-2 h-2', delay: 0 },
      { left: '28%', top: '72%', size: 'w-1.5 h-1.5', delay: 0.8 },
      { left: '55%', top: '12%', size: 'w-2 h-2', delay: 1.4 },
      { left: '68%', top: '65%', size: 'w-1.5 h-1.5', delay: 0.4 },
      { left: '82%', top: '30%', size: 'w-2 h-2', delay: 1.1 },
      { left: '38%', top: '40%', size: 'w-1.5 h-1.5', delay: 0.2 }
    ];
  }

  handleMouseMove(event: MouseEvent): void {
    // Handle mouse move for spotlight effect
    const sectionElement = event.currentTarget as HTMLElement;
    const rect = sectionElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Ensure coordinates are within bounds
    const boundedX = Math.max(0, Math.min(x, rect.width));
    const boundedY = Math.max(0, Math.min(y, rect.height));
    
    this.spotlight = `radial-gradient(600px circle at ${boundedX}px ${boundedY}px, rgba(255,255,255,0.15), transparent 40%)`;
  }
}