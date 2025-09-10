import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-api-test',
  template: `
    <div class="api-test-container" style="padding: 20px; max-width: 800px; margin: 0 auto;">
      <h2>API Test Panel</h2>
      
      <div class="test-section" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
        <h3>Authentication Test</h3>
        <div style="margin-bottom: 10px;">
          <input type="email" [(ngModel)]="testEmail" placeholder="Email" style="margin-right: 10px; padding: 5px;">
          <input type="password" [(ngModel)]="testPassword" placeholder="Password" style="margin-right: 10px; padding: 5px;">
          <button (click)="testLogin()" [disabled]="loading">Test Login</button>
        </div>
        <div *ngIf="loginResult" style="background: #f0f0f0; padding: 10px; border-radius: 3px;">
          <pre>{{ loginResult | json }}</pre>
        </div>
      </div>

      <div class="test-section" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
        <h3>API Endpoints Test</h3>
        <div style="margin-bottom: 10px;">
          <button (click)="testAcademyData()" [disabled]="loading">Test Academy Data</button>
          <button (click)="testBranchesData()" [disabled]="loading" style="margin-left: 10px;">Test Branches Data</button>
          <button (click)="testCoursesData()" [disabled]="loading" style="margin-left: 10px;">Test Courses Data</button>
        </div>
        <div *ngIf="apiResult" style="background: #f0f0f0; padding: 10px; border-radius: 3px;">
          <pre>{{ apiResult | json }}</pre>
        </div>
      </div>

      <div class="test-section" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
        <h3>Current Token</h3>
        <div style="background: #f0f0f0; padding: 10px; border-radius: 3px; word-break: break-all;">
          {{ currentToken || 'No token available' }}
        </div>
        <button (click)="clearToken()" style="margin-top: 10px;">Clear Token</button>
      </div>

      <div *ngIf="loading" style="text-align: center; padding: 20px;">
        Loading...
      </div>
    </div>
  `,
  styles: [`
    .api-test-container {
      font-family: Arial, sans-serif;
    }
    button {
      padding: 8px 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 3px;
      cursor: pointer;
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    input {
      border: 1px solid #ddd;
      border-radius: 3px;
    }
  `]
})
export class ApiTestComponent implements OnInit {
  testEmail = 'test@example.com';
  testPassword = 'password123';
  loading = false;
  loginResult: any = null;
  apiResult: any = null;
  currentToken: string | null = null;

  constructor(
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.currentToken = this.authService.getToken();
  }

  testLogin(): void {
    this.loading = true;
    this.loginResult = null;
    
    this.authService.login(this.testEmail, this.testPassword).subscribe({
      next: (result) => {
        this.loginResult = result;
        this.loading = false;
        console.log('Login successful:', result);
        
        // If login successful, store the token
        if (result.accessToken || result.token) {
          this.authService.setToken(result.accessToken || result.token);
          this.currentToken = this.authService.getToken();
        }
      },
      error: (error) => {
        this.loginResult = { error: error.message || 'Login failed', status: error.status };
        this.loading = false;
        console.error('Login failed:', error);
      }
    });
  }

  testAcademyData(): void {
    this.loading = true;
    this.apiResult = null;
    
    this.apiService.getAcademyData().subscribe({
      next: (result) => {
        this.apiResult = result;
        this.loading = false;
        console.log('Academy data:', result);
      },
      error: (error) => {
        this.apiResult = { error: error.message || 'API call failed', status: error.status };
        this.loading = false;
        console.error('Academy data failed:', error);
      }
    });
  }

  testBranchesData(): void {
    this.loading = true;
    this.apiResult = null;
    
    this.apiService.getBranchesData().subscribe({
      next: (result) => {
        this.apiResult = result;
        this.loading = false;
        console.log('Branches data:', result);
      },
      error: (error) => {
        this.apiResult = { error: error.message || 'API call failed', status: error.status };
        this.loading = false;
        console.error('Branches data failed:', error);
      }
    });
  }

  testCoursesData(): void {
    this.loading = true;
    this.apiResult = null;
    
    this.apiService.getAcademyClaseMaster().subscribe({
      next: (result) => {
        this.apiResult = result;
        this.loading = false;
        console.log('Courses data:', result);
      },
      error: (error) => {
        this.apiResult = { error: error.message || 'API call failed', status: error.status };
        this.loading = false;
        console.error('Courses data failed:', error);
      }
    });
  }

  clearToken(): void {
    this.authService.logout();
    this.currentToken = null;
    this.loginResult = null;
    this.apiResult = null;
  }
}