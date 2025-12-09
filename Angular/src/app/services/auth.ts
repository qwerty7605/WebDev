import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  contact_number?: string;
  department?: string;
}

export interface Admin {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
}

export interface AuthResponse {
  message: string;
  user?: User;
  admin?: Admin;
  token: string;
  type: 'user' | 'admin';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | Admin | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is already logged in
    const token = this.getToken();
    if (token) {
      this.loadCurrentUser();
    }
  }

  // User Registration
  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        tap(response => {
          this.handleAuthResponse(response);
        })
      );
  }

  // User Login (accepts username or email)
  loginUser(identifier: string, password: string, isEmail: boolean = false): Observable<AuthResponse> {
    const payload: any = { password };

    if (isEmail) {
      payload.email = identifier;
    } else {
      payload.username = identifier;
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, payload).pipe(
      tap(response => {
        this.handleAuthResponse(response);
      })
    );
  }

  // Admin Login (accepts username or email)
  loginAdmin(identifier: string, password: string, isEmail: boolean = false): Observable<AuthResponse> {
    const payload: any = { password };

    if (isEmail) {
      payload.email = identifier;
    } else {
      payload.username = identifier;
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/admin/login`, payload).pipe(
      tap(response => {
        this.handleAuthResponse(response);
      })
    );
  }

  // Unified Login - automatically detects if credentials are for user or admin
  login(identifier: string, password: string, isEmail: boolean = false): Observable<AuthResponse> {
    const payload: any = { password };

    if (isEmail) {
      payload.email = identifier;
    } else {
      payload.username = identifier;
    }

    // Try user login first
    return new Observable<AuthResponse>(observer => {
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, payload).subscribe({
        next: (response) => {
          this.handleAuthResponse(response);
          observer.next(response);
          observer.complete();
        },
        error: () => {
          // If user login fails, try admin login
          this.http.post<AuthResponse>(`${this.apiUrl}/auth/admin/login`, payload).subscribe({
            next: (response) => {
              this.handleAuthResponse(response);
              observer.next(response);
              observer.complete();
            },
            error: (error) => {
              observer.error(error);
            }
          });
        }
      });
    });
  }

  // Helper method to handle auth response
  private handleAuthResponse(response: AuthResponse): void {
    this.setToken(response.token);
    this.setUserType(response.type);
    this.currentUserSubject.next(response.user || response.admin || null);
  }

  // Refresh JWT token
  refreshToken(): Observable<AuthResponse> {
    const userType = this.getUserType();
    const endpoint = userType === 'admin' ? '/auth/admin/refresh' : '/auth/refresh';

    return this.http.post<AuthResponse>(`${this.apiUrl}${endpoint}`, {}).pipe(
      tap(response => {
        this.handleAuthResponse(response);
      })
    );
  }

  // Logout
  logout(): Observable<any> {
    const userType = this.getUserType();
    const endpoint = userType === 'admin' ? '/admin/logout' : '/user/logout';

    return this.http.post(`${this.apiUrl}${endpoint}`, {})
      .pipe(
        tap(() => {
          this.clearAuth();
        })
      );
  }

  // Load current user
  private loadCurrentUser(): void {
    const userType = this.getUserType();
    const endpoint = userType === 'admin' ? '/admin/profile' : '/user';

    this.http.get<any>(`${this.apiUrl}${endpoint}`).subscribe({
      next: (response) => {
        this.currentUserSubject.next(response.user || response.admin || null);
      },
      error: () => {
        this.clearAuth();
      }
    });
  }

  // Token management
  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setUserType(type: 'user' | 'admin'): void {
    localStorage.setItem('user_type', type);
  }

  getUserType(): 'user' | 'admin' | null {
    return localStorage.getItem('user_type') as 'user' | 'admin' | null;
  }

  private clearAuth(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_type');
    this.currentUserSubject.next(null);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Forgot Password - Auto-detect user or admin
  forgotPassword(email: string): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${this.apiUrl}/password/forgot`, { email });
  }

  // Forgot Password - Send reset link to user
  forgotPasswordUser(email: string): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${this.apiUrl}/password/forgot/user`, { email });
  }

  // Forgot Password - Send reset link to admin
  forgotPasswordAdmin(email: string): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${this.apiUrl}/password/forgot/admin`, { email });
  }

  // Reset Password
  resetPassword(email: string, token: string, password: string, password_confirmation: string, type: 'user' | 'admin'): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${this.apiUrl}/password/reset`, {
      email,
      token,
      password,
      password_confirmation,
      type
    });
  }
}
