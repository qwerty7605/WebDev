import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html'
})
export class RegisterComponent {
  formData = {
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    full_name: '',
    contact_number: '',
    department: ''
  };
  errorMessage = '';
  isLoading = false;
  showPassword = false;
  showPasswordConfirmation = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onRegister(): void {
    // Validation
    if (!this.formData.username || !this.formData.email || !this.formData.password || !this.formData.full_name) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    if (this.formData.password !== this.formData.password_confirmation) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.formData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;

        // Handle validation errors
        if (error.error?.errors) {
          const errors = Object.values(error.error.errors).flat();
          this.errorMessage = errors.join(', ');
        } else {
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  togglePasswordConfirmationVisibility(): void {
    this.showPasswordConfirmation = !this.showPasswordConfirmation;
  }
}
