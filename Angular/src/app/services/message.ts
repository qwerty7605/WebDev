import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ComplaintMessage {
  id: number;
  complaint_id: number;
  sender_id: number;
  sender_type: 'user' | 'admin';
  sender: {
    id: number;
    full_name: string;
    email?: string;
    role?: string;
  } | null;
  message: string;
  attachment_path: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface UnreadCountResponse {
  unread_count: number;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Get all messages for a complaint
   */
  getMessages(complaintId: number): Observable<ComplaintMessage[]> {
    return this.http.get<ComplaintMessage[]>(`${this.apiUrl}/complaints/${complaintId}/messages`);
  }

  /**
   * Send a new message
   */
  sendMessage(complaintId: number, message: string): Observable<ComplaintMessage> {
    return this.http.post<ComplaintMessage>(`${this.apiUrl}/complaints/${complaintId}/messages`, {
      message
    });
  }

  /**
   * Mark a message as read
   */
  markAsRead(messageId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/messages/${messageId}/read`, {});
  }

  /**
   * Get unread message count for a complaint
   */
  getUnreadCount(complaintId: number): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(`${this.apiUrl}/complaints/${complaintId}/messages/unread-count`);
  }
}
