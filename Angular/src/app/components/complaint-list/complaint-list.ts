import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ComplaintService, Complaint } from '../../services/complaint';

@Component({
  selector: 'app-complaint-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './complaint-list.html'
})
export class ComplaintListComponent implements OnInit {
  complaints: Complaint[] = [];
  filteredComplaints: Complaint[] = [];
  isLoading = true;
  errorMessage = '';
  filterStatus = 'all';

  constructor(
    private complaintService: ComplaintService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadComplaints();
  }

  loadComplaints(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.complaintService.getUserComplaints().subscribe({
      next: (response) => {
        this.complaints = response.complaints;
        this.filteredComplaints = this.complaints;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading complaints:', error);
        this.errorMessage = 'Failed to load complaints';
        this.isLoading = false;
      }
    });
  }

  filterByStatus(status: string): void {
    this.filterStatus = status;

    if (status === 'all') {
      this.filteredComplaints = this.complaints;
    } else {
      this.filteredComplaints = this.complaints.filter(c => c.status === status);
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  viewDetails(id: number): void {
    this.router.navigate(['/complaints', id]);
  }

  createNew(): void {
    this.router.navigate(['/complaint-form']);
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

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'High':
        return 'text-danger fw-bold';
      case 'Medium':
        return 'text-warning fw-bold';
      case 'Low':
        return 'text-success fw-bold';
      default:
        return '';
    }
  }
}
