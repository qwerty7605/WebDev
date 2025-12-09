import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ComplaintService, Category, Admin, ComplaintFormData } from '../../services/complaint';

@Component({
  selector: 'app-complaint-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './complaint-form.html'
})
export class ComplaintFormComponent implements OnInit {
  categories: Category[] = [];
  admins: Admin[] = [];
  formData: ComplaintFormData = {
    category_id: 0,
    subject: '',
    description: '',
    priority: 'Medium',
    assigned_to: 0,
    is_anonymous: false
  };
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private complaintService: ComplaintService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadAdmins();
  }

  loadCategories(): void {
    this.complaintService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.errorMessage = 'Failed to load categories';
      }
    });
  }

  loadAdmins(): void {
    this.complaintService.getAvailableAdmins().subscribe({
      next: (response) => {
        this.admins = response.admins;
      },
      error: (error) => {
        console.error('Error loading admins:', error);
        this.errorMessage = 'Failed to load available admins';
      }
    });
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Prepare form data, converting 0 to undefined for optional assigned_to
    const submitData: ComplaintFormData = {
      ...this.formData,
      assigned_to: this.formData.assigned_to === 0 ? undefined : this.formData.assigned_to
    };

    this.complaintService.submitComplaint(submitData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Complaint submitted successfully! Complaint Number: ' + response.complaint.complaint_number;

        setTimeout(() => {
          this.router.navigate(['/complaints']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error submitting complaint:', error);
        this.errorMessage = error.error?.message || 'Failed to submit complaint. Please try again.';
      }
    });
  }

  validateForm(): boolean {
    if (!this.formData.category_id || this.formData.category_id === 0) {
      this.errorMessage = 'Please select a category';
      return false;
    }

    if (!this.formData.subject.trim()) {
      this.errorMessage = 'Please enter a subject';
      return false;
    }

    if (!this.formData.description.trim()) {
      this.errorMessage = 'Please enter a description';
      return false;
    }

    return true;
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
