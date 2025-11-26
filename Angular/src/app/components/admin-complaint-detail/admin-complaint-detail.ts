import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ComplaintService, Complaint } from '../../services/complaint';

@Component({
  selector: 'app-admin-complaint-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-complaint-detail.html',
  styleUrl: './admin-complaint-detail.css'
})
export class AdminComplaintDetailComponent implements OnInit {
  complaint: Complaint | null = null;
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  isUpdating = false;

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
    this.complaintService.getComplaintById(id).subscribe({
      next: (response) => {
        this.complaint = response.complaint;
        this.updateForm.status = this.complaint.status;
        this.isLoading = false;
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

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'In Progress':
        return 'status-progress';
      case 'Resolved':
        return 'status-resolved';
      default:
        return '';
    }
  }
}
