import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ComplaintService, Complaint } from '../../services/complaint';
import { ComplaintChat } from '../complaint-chat/complaint-chat';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-complaint-detail',
  imports: [CommonModule, ComplaintChat],
  templateUrl: './complaint-detail.html'
})
export class ComplaintDetailComponent implements OnInit {
  complaint: Complaint | null = null;
  isLoading = true;
  errorMessage = '';
  apiUrl = environment.apiUrl;

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
    this.complaintService.getComplaintById(id).subscribe({
      next: (response) => {
        this.complaint = response.complaint;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading complaint:', error);
        this.errorMessage = 'Failed to load complaint details';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/complaints']);
  }

  deleteComplaint(): void {
    if (!this.complaint || this.complaint.status !== 'Pending') {
      return;
    }

    if (!confirm(`Are you sure you want to delete this complaint?\n\nSubject: ${this.complaint.subject}\n\nThis action cannot be undone.`)) {
      return;
    }

    this.complaintService.deleteComplaint(this.complaint.id).subscribe({
      next: (response) => {
        this.router.navigate(['/complaints']);
      },
      error: (error) => {
        console.error('Error deleting complaint:', error);
        this.errorMessage = error.error?.message || 'Failed to delete complaint. Please try again.';
      }
    });
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
