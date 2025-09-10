import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface CheckResult {
  path: string;
  ok: boolean;
  status?: number;
  error?: string;
  message?: string;
}

@Component({
  selector: 'app-api-health',
  template: `
  <div class="api-health">
    <h2>API Health Check</h2>

    <section class="token">
      <label for="token">Bearer Token</label>
      <input id="token" type="text" [(ngModel)]="tokenInput" placeholder="Paste JWT (with or without 'Bearer ')" />
      <button (click)="setToken()">Save Token</button>
      <button (click)="clearToken()">Clear Token</button>
    </section>

    <section class="swagger">
      <button (click)="fetchSwaggerPaths()" [disabled]="loadingSwagger">Fetch Swagger Paths</button>
      <span *ngIf="loadingSwagger">Loading swagger...</span>
      <div *ngIf="swaggerPaths.length">
        <p>Swagger paths: {{ swaggerPaths.length }}</p>
        <details>
          <summary>Show paths</summary>
          <ul>
            <li *ngFor="let p of swaggerPaths">{{ p }}</li>
          </ul>
        </details>
      </div>
    </section>

    <section class="checks">
      <button (click)="runChecks()" [disabled]="running">Run Sample GET Checks</button>
      <span *ngIf="running">Running...</span>

      <table *ngIf="checks.length">
        <thead>
          <tr>
            <th>Path</th>
            <th>Status</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of checks" [class.ok]="c.ok" [class.fail]="!c.ok">
            <td>{{ c.path }}</td>
            <td>{{ c.status || '-' }}</td>
            <td>{{ c.ok ? (c.message || 'OK') : (c.error || 'Error') }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
  `,
  styles: [
    `.api-health { padding: 1rem; }`,
    `.api-health section { margin: 1rem 0; }`,
    `.api-health table { width: 100%; border-collapse: collapse; }`,
    `.api-health th, .api-health td { border: 1px solid #ddd; padding: 8px; }`,
    `.api-health tr.ok { background: #e9f7ef; }`,
    `.api-health tr.fail { background: #fdecea; }`,
    `.api-health input { width: 420px; max-width: 100%; margin-right: .5rem; }`,
    `.api-health button { margin-right: .5rem; }`,
  ]
})
export class ApiHealthComponent implements OnInit {
  baseUrl = environment.apiBaseUrl;
  swaggerPaths: string[] = [];
  loadingSwagger = false;
  checks: CheckResult[] = [];
  running = false;
  tokenInput = '';

  // default GET paths to verify quickly
  samplePaths: string[] = [
    '/api/ProgramsDetail',
    '/api/ProgramsContentMaster',
    '/api/ProgramsContentDetail',
    '/api/ProjectsMaster',
    '/api/ProjectsDetail',
    '/api/QuestionBankMaster',
    '/api/QuestionBankDetail',
    '/api/SkillDevelopment',
    '/api/TeacherData',
    '/api/StudentData',
    '/api/BranchData',
    '/api/CountryCode',
    '/api/GovernorateCode',
    '/api/CityCode',
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchSwaggerPaths();
  }

  setToken(): void {
    const t = (this.tokenInput || '').trim();
    if (!t) return;
    // normalize: store raw token without 'Bearer '
    const raw = t.toLowerCase().startsWith('bearer ')
      ? t.slice(7)
      : t;
    localStorage.setItem('access_token', raw);
    alert('Token saved to localStorage.access_token');
  }

  clearToken(): void {
    localStorage.removeItem('access_token');
    alert('Token removed from localStorage');
  }

  fetchSwaggerPaths(): void {
    this.loadingSwagger = true;
    this.http.get<{ count: number; paths: string[] }>(`${this.baseUrl}/swagger/paths`).subscribe({
      next: (res) => {
        this.swaggerPaths = res.paths || [];
      },
      error: () => {
        this.swaggerPaths = [];
      },
      complete: () => (this.loadingSwagger = false),
    });
  }

  async runChecks(): Promise<void> {
    this.running = true;
    this.checks = [];

    let headers = new HttpHeaders();
    const t = localStorage.getItem('access_token') || environment.devToken || '';
    if (t) {
      headers = headers.set('Authorization', t);
    }

    for (const p of this.samplePaths) {
      try {
        const resp = await this.http
          .get(`${this.baseUrl}${p}`, { observe: 'response', headers })
          .toPromise();
        const body: any = resp?.body;
        // derive count from common wrappers
        const arr = Array.isArray(body)
          ? body
          : (body?.items || body?.data || body?.result || body?.value || []);
        const count = Array.isArray(arr) ? arr.length : (typeof arr === 'number' ? arr : undefined);
        const message = typeof count === 'number' ? `OK (count=${count})` : 'OK';
        this.checks.push({ path: p, ok: true, status: resp?.status, message });
      } catch (e: any) {
        this.checks.push({
          path: p,
          ok: false,
          status: e?.status,
          error: e?.message || 'Error',
        });
      }
    }

    this.running = false;
  }
}
