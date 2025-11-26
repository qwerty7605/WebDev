import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ComplaintService, Category, ComplaintFormData } from '../../services/complaint';

@Component({
  selector: 'app-complaint-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './complaint-form.html',
  styleUrl: './complaint-form.css'
})
export class ComplaintFormComponent implements OnInit {
  categories: Category[] = [];
  formData: ComplaintFormData = {
    category_id: 0,
    subject: '',
    description: '',
    priority: 'Medium',
    location: ''
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

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.complaintService.submitComplaint(this.formData).subscribe({
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
