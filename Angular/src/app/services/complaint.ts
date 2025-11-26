import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id: number;
  category_name: string;
  description: string;
  is_active: boolean;
}

export interface Complaint {
  id: number;
  user_id: number;
  category_id: number;
  complaint_number: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Resolved';
  location?: string;
  attachment_path?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  category?: Category;
  user?: any;
  updates?: ComplaintUpdate[];
}

export interface ComplaintUpdate {
  id: number;
  complaint_id: number;
  admin_id: number;
  previous_status: string;
  new_status: string;
  comments?: string;
  resolution_details?: string;
  created_at: string;
  admin?: any;
}

export interface ComplaintFormData {
  category_id: number;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  location?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private apiUrl = 'http://localhost:80/api';

  constructor(private http: HttpClient) {}

  /**
   * Get all categories
   */
  getCategories(): Observable<{ categories: Category[] }> {
    return this.http.get<{ categories: Category[] }>(`${this.apiUrl}/categories`);
  }

  /**
   * Submit a new complaint
   */
  submitComplaint(data: ComplaintFormData): Observable<{ message: string; complaint: Complaint }> {
    return this.http.post<{ message: string; complaint: Complaint }>(
      `${this.apiUrl}/complaints`,
      data
    );
  }

  /**
   * Get user's complaints
   */
  getUserComplaints(): Observable<{ complaints: Complaint[] }> {
    return this.http.get<{ complaints: Complaint[] }>(`${this.apiUrl}/complaints`);
  }

  /**
   * Get single complaint details
   */
  getComplaintById(id: number): Observable<{ complaint: Complaint }> {
    return this.http.get<{ complaint: Complaint }>(`${this.apiUrl}/complaints/${id}`);
  }

  /**
   * Get all complaints (Admin only)
   */
  getAllComplaints(status?: string, category?: number): Observable<{ complaints: Complaint[] }> {
    let url = `${this.apiUrl}/admin/complaints`;
    const params: string[] = [];

    if (status) params.push(`status=${status}`);
    if (category) params.push(`category=${category}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<{ complaints: Complaint[] }>(url);
  }

  /**
   * Update complaint status (Admin only)
   */
  updateComplaintStatus(
    id: number,
    data: {
      status: string;
      comments?: string;
      resolution_details?: string;
    }
  ): Observable<{ message: string; complaint: Complaint }> {
    return this.http.put<{ message: string; complaint: Complaint }>(
      `${this.apiUrl}/admin/complaints/${id}/status`,
      data
    );
  }

  /**
   * Get statistics (Admin only)
   */
  getStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/statistics`);
  }
}
