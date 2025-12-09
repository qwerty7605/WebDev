import { Component, Input, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ComplaintMessage } from '../../services/message';
import { AuthService } from '../../services/auth';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-complaint-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './complaint-chat.html',
  styleUrl: './complaint-chat.css',
})
export class ComplaintChat implements OnInit, OnDestroy {
  @Input() complaintId!: number;

  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  messages: ComplaintMessage[] = [];
  newMessage: string = '';
  isLoading: boolean = false;
  isSending: boolean = false;
  errorMessage: string = '';
  currentUserId: number | null = null;
  currentUserType: 'user' | 'admin' | null = null;

  private pollingSubscription?: Subscription;

  ngOnInit(): void {
    // Get current user info
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
      }
    });

    // Get user type from localStorage
    const userType = localStorage.getItem('userType');
    this.currentUserType = userType as 'user' | 'admin';

    // Load initial messages
    this.loadMessages();

    // Start polling for new messages every 3 seconds
    this.pollingSubscription = interval(3000)
      .pipe(switchMap(() => this.messageService.getMessages(this.complaintId)))
      .subscribe({
        next: (messages) => {
          this.messages = messages;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error polling messages:', error);
        }
      });
  }

  ngOnDestroy(): void {
    // Stop polling when component is destroyed
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  loadMessages(): void {
    this.isLoading = true;
    this.messageService.getMessages(this.complaintId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load messages';
        this.isLoading = false;
        console.error('Error loading messages:', error);
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) {
      return;
    }

    this.isSending = true;
    this.errorMessage = '';

    this.messageService.sendMessage(this.complaintId, this.newMessage.trim()).subscribe({
      next: (message) => {
        this.messages.push(message);
        this.newMessage = '';
        this.isSending = false;
        this.scrollToBottom();
      },
      error: (error) => {
        this.errorMessage = 'Failed to send message';
        this.isSending = false;
        console.error('Error sending message:', error);
      }
    });
  }

  isOwnMessage(message: ComplaintMessage): boolean {
    return message.sender_id === this.currentUserId && message.sender_type === this.currentUserType;
  }

  getSenderName(message: ComplaintMessage): string {
    if (!message.sender) {
      return 'Unknown';
    }
    return message.sender.full_name;
  }

  getSenderRole(message: ComplaintMessage): string {
    if (message.sender_type === 'admin' && message.sender?.role) {
      return `(${message.sender.role})`;
    }
    return '';
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }
}
