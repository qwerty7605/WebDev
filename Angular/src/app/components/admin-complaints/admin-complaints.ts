import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ComplaintService, Complaint } from '../../services/complaint';

@Component({
  selector: 'app-admin-complaints',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-complaints.html'
})
export class AdminComplaintsComponent implements OnInit {
  complaints: Complaint[] = [];
  filteredComplaints: Complaint[] = [];
  isLoading = true;
  errorMessage = '';
  filterStatus = 'all';
  searchQuery = '';
  searchSuggestions: string[] = [];
  showSuggestions = false;

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
        this.complaints = this.sortComplaintsByFIFO(response.complaints);
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

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.applyFilter();
    this.updateSearchSuggestions();
  }

  onSearchFocus(): void {
    this.showSuggestions = true;
    this.updateSearchSuggestions();
  }

  onSearchBlur(): void {
    // Delay to allow clicking on suggestions
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  selectSuggestion(suggestion: string): void {
    this.searchQuery = suggestion;
    this.showSuggestions = false;
    this.applyFilter();
  }

  updateSearchSuggestions(): void {
    if (!this.searchQuery || this.searchQuery.length < 2) {
      this.searchSuggestions = [];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    const suggestions = new Set<string>();

    this.complaints.forEach(complaint => {
      // Suggestion from complaint number
      if (complaint.complaint_number.toLowerCase().includes(query)) {
        suggestions.add(complaint.complaint_number);
      }

      // Suggestion from subject
      if (complaint.subject.toLowerCase().includes(query)) {
        suggestions.add(complaint.subject);
      }

      // Suggestion from category
      if (complaint.category?.category_name.toLowerCase().includes(query)) {
        suggestions.add(complaint.category.category_name);
      }

      // Suggestion from user name (if not anonymous)
      if (!complaint.is_anonymous && complaint.user?.full_name?.toLowerCase().includes(query)) {
        suggestions.add(complaint.user.full_name);
      }
    });

    this.searchSuggestions = Array.from(suggestions).slice(0, 10);
  }

  applyFilter(): void {
    let filtered = this.complaints;

    // Apply status filter
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === this.filterStatus);
    }

    // Apply search filter
    if (this.searchQuery && this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(complaint => {
        // Search by complaint number
        if (complaint.complaint_number.toLowerCase().includes(query)) {
          return true;
        }

        // Search by subject
        if (complaint.subject.toLowerCase().includes(query)) {
          return true;
        }

        // Search by category
        if (complaint.category?.category_name.toLowerCase().includes(query)) {
          return true;
        }

        // Search by user name (if not anonymous)
        if (!complaint.is_anonymous && complaint.user?.full_name?.toLowerCase().includes(query)) {
          return true;
        }

        // Search by date
        const dateStr = new Date(complaint.created_at).toLocaleDateString();
        if (dateStr.toLowerCase().includes(query)) {
          return true;
        }

        return false;
      });
    }

    // Maintain FIFO order after filtering
    this.filteredComplaints = this.sortComplaintsByFIFO(filtered);
  }

  /**
   * Sort complaints using FIFO (First In First Out) algorithm
   * Orders by created_at ascending - oldest complaints first
   */
  sortComplaintsByFIFO(complaints: Complaint[]): Complaint[] {
    return complaints.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateA - dateB; // Ascending order - oldest first
    });
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
}
