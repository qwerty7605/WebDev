import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ComplaintService, Complaint } from '../../services/complaint';
import { ComplaintChat } from '../complaint-chat/complaint-chat';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-complaint-detail',
  imports: [CommonModule, FormsModule, ComplaintChat],
  templateUrl: './admin-complaint-detail.html'
})
export class AdminComplaintDetailComponent implements OnInit {
  complaint: Complaint | null = null;
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  isUpdating = false;
  apiUrl = environment.apiUrl;

  updateForm = {
    status: '',
    comments: '',
    resolution_details: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private complaintService: ComplaintService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadComplaint(parseInt(id));
    }
  }

  loadComplaint(id: number): void {
    this.complaintService.getAdminComplaintById(id).subscribe({
      next: (response) => {
        this.complaint = response.complaint;
        this.updateForm.status = this.complaint.status;
        this.isLoading = false;

        // Debug logging
        if (this.complaint.attachment) {
          console.log('Attachment from API:', this.complaint.attachment);
          console.log('Generated image URL:', this.getAttachmentUrl());
        }
      },
      error: (error) => {
        console.error('Error loading complaint:', error);
        this.errorMessage = 'Failed to load complaint details';
        this.isLoading = false;
      }
    });
  }

  updateStatus(): void {
    if (!this.complaint) return;

    if (this.updateForm.status === this.complaint.status && !this.updateForm.comments && !this.updateForm.resolution_details) {
      this.errorMessage = 'No changes to save';
      return;
    }

    this.isUpdating = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.complaintService.updateComplaintStatus(this.complaint.id, this.updateForm).subscribe({
      next: (response) => {
        this.complaint = response.complaint;
        this.updateForm.comments = '';
        this.updateForm.resolution_details = '';
        this.successMessage = 'Complaint updated successfully!';
        this.isUpdating = false;

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error updating complaint:', error);
        this.errorMessage = error.error?.message || 'Failed to update complaint';
        this.isUpdating = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/complaints']);
  }

  getImageUrl(filePath: string): string {
    // Remove /api from apiUrl and append storage path
    const baseUrl = this.apiUrl.replace('/api', '');
    return `${baseUrl}/storage/${filePath}`;
  }

  getAttachmentUrl(): string | null {
    if (!this.complaint?.attachment) {
      return null;
    }
    return this.getImageUrl(this.complaint.attachment.file_path);
  }

  isImage(): boolean {
    if (!this.complaint?.attachment) {
      return false;
    }
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    return imageTypes.includes(this.complaint.attachment.mime_type);
  }

  isVideo(): boolean {
    if (!this.complaint?.attachment) {
      return false;
    }
    const videoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv', 'video/webm'];
    return videoTypes.includes(this.complaint.attachment.mime_type);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'bg-warning';
      case 'In Progress':
        return 'bg-info';
      case 'Resolved':
        return 'bg-success';
      default:
        return '';
    }
  }
}
