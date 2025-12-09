import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ComplaintService } from '../../services/complaint';
import { AuthService } from '../../services/auth';

interface Statistics {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  by_category: any[];
  by_priority: any[];
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html'
})
export class AdminDashboardComponent implements OnInit {
  statistics: Statistics | null = null;
  isLoading = true;
  errorMessage = '';
  adminName = '';

  constructor(
    private complaintService: ComplaintService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.adminName = (user as any).full_name;
      }
    });
  }

  loadStatistics(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.complaintService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.errorMessage = 'Failed to load statistics';
        this.isLoading = false;
      }
    });
  }

  viewAllComplaints(): void {
    this.router.navigate(['/admin/complaints']);
  }

  viewPendingComplaints(): void {
    this.router.navigate(['/admin/complaints'], { queryParams: { status: 'Pending' } });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }
}
