import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.html'
})
export class ResetPasswordComponent implements OnInit {
  email = '';
  token = '';
  userType: 'user' | 'admin' = 'user';
  password = '';
  password_confirmation = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.email = params['email'] || '';
      this.userType = params['type'] || 'user';

      if (!this.token || !this.email) {
        this.errorMessage = 'Invalid reset link. Please request a new password reset.';
      }
    });
  }

  onSubmit(): void {
    if (!this.password || !this.password_confirmation) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    if (this.password !== this.password_confirmation) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.resetPassword(
      this.email,
      this.token,
      this.password,
      this.password_confirmation,
      this.userType
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;

        if (error.error?.errors) {
          const errors = Object.values(error.error.errors).flat() as string[];
          this.errorMessage = errors.join(', ');
        } else {
          this.errorMessage = error.error?.message || 'Failed to reset password. Please try again.';
        }
      }
    });
  }
}
