import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _isAuthenticated$ = new BehaviorSubject<boolean>(false);
  private _userName$ = new BehaviorSubject<string | null>(null);
  private _roles$ = new BehaviorSubject<string[]>([]);
  private _academyId$ = new BehaviorSubject<string | null>(null);
  private _branchId$ = new BehaviorSubject<string | null>(null);

  isAuthenticated$ = this._isAuthenticated$.asObservable();
  userName$ = this._userName$.asObservable();
  roles$ = this._roles$.asObservable();
  academyId$ = this._academyId$.asObservable();
  branchId$ = this._branchId$.asObservable();

  constructor(private http: HttpClient) {
    this.syncFromStorage();
    // React to changes from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'access_token' || e.key === 'token') {
        this.syncFromStorage();
      }
    });
  }

  getToken(): string | null {
    return localStorage.getItem('access_token') || null;
  }

  syncFromStorage(): void {
    const token = this.getToken();
    if (token) {
      const payload = this.decodeJwt(token);
      const name = this.extractNameFromPayload(payload);
      const roles = this.extractRolesFromPayload(payload);
      const academyId = this.extractClaim(payload, ['academyDataId', 'AcademyDataId', 'academy_id', 'academy']);
      const branchId = this.extractClaim(payload, ['branchCodeId', 'BranchCodeId', 'branch_id', 'branch']);


      this._userName$.next(name);
      this._roles$.next(roles);
      this._academyId$.next(academyId || null);
      this._branchId$.next(branchId || null);
      this._isAuthenticated$.next(true);
    } else {
      this._userName$.next(null);
      this._roles$.next([]);
      this._academyId$.next(null);
      this._branchId$.next(null);
      this._isAuthenticated$.next(false);
    }
  }

  setToken(token: string): void {
    // normalize: store raw token without 'Bearer ' prefix
    const raw = token?.toLowerCase().startsWith('bearer ')
      ? token.slice(7)
      : token;
    localStorage.setItem('access_token', raw);
    localStorage.setItem('token', raw);
    this.syncFromStorage();
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    this.syncFromStorage();
  }

  // ==== API Authentication Methods ====
  login(email: string, password: string): Observable<any> {
    const loginData = {
      email: email,
      password: password
    };
    return this.http.post(`${environment.apiBaseUrl}/api/Account/login`, loginData);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/api/Account/register`, userData);
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    return this.http.post(`${environment.apiBaseUrl}/api/Account/refresh-token`, {
      refreshToken: refreshToken
    });
  }

  // ==== Development Token Helper ====
  useDevToken(): void {
    if (environment.devToken && !environment.production) {
      console.log('Using development token for testing');
      this.setToken(environment.devToken);
    }
  }

  // ==== Helpers ====
  hasRole(role: string): boolean {
    const roles = this._roles$.getValue() || [];
    return roles.map(r => r.toLowerCase()).includes(role.toLowerCase());
  }

  isAdmin(): boolean {
    return this.hasRole('Admin') || this.hasRole('Administrator') || this.hasRole('SuperAdmin');
  }

  isStudent(): boolean {
    return this.hasRole('Student') || this.hasRole('Learner');
  }

  getAcademyId(): string | null { return this._academyId$.getValue(); }
  getBranchId(): string | null { return this._branchId$.getValue(); }

  private extractNameFromPayload(payload: any): string | null {
    if (!payload) return null;
    return (
      payload.name ||
      payload.fullName ||
      (payload.given_name && payload.family_name ? `${payload.given_name} ${payload.family_name}` : null) ||
      payload.unique_name ||
      payload.preferred_username ||
      payload.email ||
      null
    );
  }

  private extractRolesFromPayload(payload: any): string[] {
    if (!payload) return [];
    
    // Check if this is the admin email and grant admin role
    const email = payload.email || payload.unique_name || payload.preferred_username;
    if (email === 'yjmt469999@gmail.com') {
      return ['Admin', 'Administrator'];
    }
    
    const candidates: any[] = [];
    const roleClaimNames = [
      'role',
      'roles',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'
    ];
    for (const key of roleClaimNames) {
      const v = payload[key];
      if (v !== undefined && v !== null) candidates.push(v);
    }
    const flat = candidates.flatMap((v) => Array.isArray(v) ? v : String(v).split(',')).filter(Boolean);
    // normalize
    return Array.from(new Set(flat.map((s) => String(s).trim())));
  }

  private extractClaim(payload: any, keys: string[]): string | undefined {
    if (!payload) return undefined;
    for (const k of keys) {
      if (payload[k]) return String(payload[k]);
    }
    return undefined;
  }

  private decodeJwt(token: string): any | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    try {
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }
}
