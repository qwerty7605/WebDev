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
    assigned_to: 0,
    is_anonymous: false
  };
  selectedFile: File | null = null;
  filePreview: string | null = null;
  fileType: 'image' | 'video' | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isDragging = false;

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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  handleFile(file: File): void {
    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv', 'video/webm'];
    const allAllowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

    if (!allAllowedTypes.includes(file.type)) {
      this.errorMessage = 'Unsupported file type. Please upload MP4, PNG, or JPEG files only.';
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      this.errorMessage = 'File size must be less than 50MB';
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';

    // Determine file type
    if (allowedImageTypes.includes(file.type)) {
      this.fileType = 'image';
    } else if (allowedVideoTypes.includes(file.type)) {
      this.fileType = 'video';
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.filePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeFile(): void {
    this.selectedFile = null;
    this.filePreview = null;
    this.fileType = null;
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Prepare FormData for file upload
    const formDataToSend = new FormData();
    formDataToSend.append('category_id', this.formData.category_id.toString());
    formDataToSend.append('subject', this.formData.subject);
    formDataToSend.append('description', this.formData.description);
    formDataToSend.append('is_anonymous', this.formData.is_anonymous ? '1' : '0');

    if (this.formData.assigned_to && this.formData.assigned_to !== 0) {
      formDataToSend.append('assigned_to', this.formData.assigned_to.toString());
    }

    if (this.selectedFile) {
      formDataToSend.append('attachment', this.selectedFile);
    }

    this.complaintService.submitComplaintWithFile(formDataToSend).subscribe({
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
