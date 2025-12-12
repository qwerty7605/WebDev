import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Category {
  id: number;
  category_name: string;
  description: string;
  is_active: boolean;
}

export interface ComplaintAttachment {
  id: number;
  complaint_id: number;
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: number;
  user_id: number;
  is_anonymous: boolean;
  category_id: number;
  assigned_to?: number;
  complaint_number: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Resolved';
  attachment_path?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  category?: Category;
  user?: any;
  assignedAdmin?: Admin;
  updates?: ComplaintUpdate[];
  attachment?: ComplaintAttachment;
}

export interface Admin {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
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
  assigned_to?: number;
  is_anonymous?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get all categories
   */
  getCategories(): Observable<{ categories: Category[] }> {
    return this.http.get<{ categories: Category[] }>(`${this.apiUrl}/categories`);
  }

  /**
   * Get all available admins (for complaint assignment)
   */
  getAvailableAdmins(): Observable<{ admins: Admin[] }> {
    return this.http.get<{ admins: Admin[] }>(`${this.apiUrl}/admins/available`);
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
   * Submit a new complaint with file attachment
   */
  submitComplaintWithFile(formData: FormData): Observable<{ message: string; complaint: Complaint }> {
    return this.http.post<{ message: string; complaint: Complaint }>(
      `${this.apiUrl}/complaints`,
      formData
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
   * Get single complaint details (Admin)
   */
  getAdminComplaintById(id: number): Observable<{ complaint: Complaint }> {
    return this.http.get<{ complaint: Complaint }>(`${this.apiUrl}/admin/complaints/${id}`);
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

  /**
   * Delete complaint (User only - Pending complaints only)
   */
  deleteComplaint(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/complaints/${id}`);
  }
}
