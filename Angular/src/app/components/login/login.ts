import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  username = '';
  password = '';
  loginType: 'user' | 'admin' = 'user';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter username/email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Detect if input is email or username
    const isEmail = this.isEmailFormat(this.username);

    const loginMethod = this.loginType === 'admin'
      ? this.authService.loginAdmin(this.username, this.password, isEmail)
      : this.authService.loginUser(this.username, this.password, isEmail);

    loginMethod.subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Login successful:', response);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }

  private isEmailFormat(value: string): boolean {
    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  switchLoginType(type: 'user' | 'admin'): void {
    this.loginType = type;
    this.errorMessage = '';
  }
}
