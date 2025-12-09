import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ComplaintService, Complaint } from '../../services/complaint';

@Component({
  selector: 'app-admin-complaints',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-complaints.html'
})
export class AdminComplaintsComponent implements OnInit {
  complaints: Complaint[] = [];
  filteredComplaints: Complaint[] = [];
  isLoading = true;
  errorMessage = '';
  filterStatus = 'all';

  constructor(
    private complaintService: ComplaintService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['status']) {
        this.filterStatus = params['status'];
      }
      this.loadComplaints();
    });
  }

  loadComplaints(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.complaintService.getAllComplaints().subscribe({
      next: (response) => {
        this.complaints = response.complaints;
        this.applyFilter();
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
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.filterStatus === 'all') {
      this.filteredComplaints = this.complaints;
    } else {
      this.filteredComplaints = this.complaints.filter(c => c.status === this.filterStatus);
    }
  }

  viewDetails(id: number): void {
    this.router.navigate(['/admin/complaints', id]);
  }

  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
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
