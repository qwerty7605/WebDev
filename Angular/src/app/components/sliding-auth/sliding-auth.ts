import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-sliding-auth',
  imports: [CommonModule, FormsModule],
  templateUrl: './sliding-auth.html',
  styleUrls: ['./sliding-auth.css']
})
export class SlidingAuthComponent implements OnInit {
  isRegisterMode = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Login form data
  loginForm = {
    email: '',
    password: '',
    rememberMe: false
  };

  // Register form data
  registerForm = {
    username: '',
    email: '',
    full_name: '',
    contact_number: '',
    department: '',
    password: '',
    password_confirmation: ''
  };

  showPassword = false;
  showPasswordConfirmation = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Set initial mode based on route
    const currentPath = this.router.url;
    this.isRegisterMode = currentPath.includes('register');
  }

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  switchToRegister(): void {
    this.isRegisterMode = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  switchToLogin(): void {
    this.isRegisterMode = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onLogin(): void {
    if (!this.validateLogin()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Detect if identifier is an email
    const isEmail = this.loginForm.email.includes('@');

    this.authService.login(this.loginForm.email, this.loginForm.password, isEmail).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }

  onRegister(): void {
    if (!this.validateRegister()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.registerForm).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Registration successful! Redirecting to dashboard...';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        if (error.error?.errors) {
          const errors = Object.values(error.error.errors).flat();
          this.errorMessage = errors.join(' ');
        } else {
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      }
    });
  }

  validateLogin(): boolean {
    if (!this.loginForm.email || !this.loginForm.password) {
      this.errorMessage = 'Please enter both email and password';
      return false;
    }
    return true;
  }

  validateRegister(): boolean {
    if (!this.registerForm.username || !this.registerForm.email || !this.registerForm.full_name) {
      this.errorMessage = 'Please fill in all required fields';
      return false;
    }

    if (!this.registerForm.password || this.registerForm.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long';
      return false;
    }

    if (this.registerForm.password !== this.registerForm.password_confirmation) {
      this.errorMessage = 'Passwords do not match';
      return false;
    }

    return true;
  }

  togglePasswordVisibility(field: 'password' | 'confirmation'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showPasswordConfirmation = !this.showPasswordConfirmation;
    }
  }

  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}
