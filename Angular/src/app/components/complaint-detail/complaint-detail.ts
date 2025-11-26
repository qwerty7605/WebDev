import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ComplaintService, Complaint } from '../../services/complaint';

@Component({
  selector: 'app-complaint-detail',
  imports: [CommonModule],
  templateUrl: './complaint-detail.html',
  styleUrl: './complaint-detail.css'
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
