import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ComplaintService, Complaint } from '../../services/complaint';
import { ComplaintChat } from '../complaint-chat/complaint-chat';

@Component({
  selector: 'app-complaint-detail',
  imports: [CommonModule, ComplaintChat],
  templateUrl: './complaint-detail.html'
})
export class ComplaintDetailComponent implements OnInit {
  complaint: Complaint | null = null;
  isLoading = true;
  errorMessage = '';

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
