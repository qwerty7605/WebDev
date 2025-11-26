import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

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
  private apiUrl = 'http://localhost:80/api';
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
          this.setToken(response.token);
          this.setUserType(response.type);
          this.currentUserSubject.next(response.user || response.admin || null);
        })
      );
  }

  // User Login
  loginUser(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, {
      username,
      password
    }).pipe(
      tap(response => {
        this.setToken(response.token);
        this.setUserType(response.type);
        this.currentUserSubject.next(response.user || null);
      })
    );
  }

  // Admin Login
  loginAdmin(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/admin/login`, {
      username,
      password
    }).pipe(
      tap(response => {
        this.setToken(response.token);
        this.setUserType(response.type);
        this.currentUserSubject.next(response.admin || null);
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

  // Get HTTP headers with authorization
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }
}
