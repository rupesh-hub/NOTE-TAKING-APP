import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { faSignOut, faBell, faUser } from '@fortawesome/free-solid-svg-icons';
import { Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthenticationService } from '../../../core/services/authentication.service';
import { WebsocketService } from '../../../features/note/websocket.service';
import {
  NotificationService,
  Notification,
} from '../../../features/notification/notification.service';
import { ToastService } from '../../../core/toast.service';

@Component({
  selector: 'ccnta-header',
  template: `
    <div
      class="bg-white mx-auto flex items-center justify-between px-4 py-2"
    >
      <!-- Logo and Welcome Section -->
      <div class="flex items-center text-gray-600">
        <fa-icon [icon]="faUser"/>
        <span class="ml-4 text-xl font-semibold font-serif">
          Welcome back, {{ user?.name || 'User' }}!
        </span>
      </div>

      <!-- Notifications and Logout Section -->
      <div class="relative flex gap-6 justify-start items-center">
        <!-- Notification Dropdown -->
        <div
          class="relative h-[48px] w-[48px] flex bg-[#8B9F82]/20 justify-center items-center rounded-full hover:bg-[#8B9F82]/30 cursor-pointer"
          [ngClass]="{
            'bg-indigo-100': unreadNotificationsCount > 0
          }"
          (click)="toggleNotifications()"
        >
          <fa-icon
            [icon]="faBell"
            [ngClass]="{
              ringing: unreadNotificationsCount > 0,
              'text-indigo-600': unreadNotificationsCount > 0,
              'text-gray-500': unreadNotificationsCount === 0
            }"
            class="text-lg font-bold"
          ></fa-icon>

          <span
            *ngIf="unreadNotificationsCount > 0"
            class="absolute top-0 -right-2 bg-[#8B9F82] h-6 w-6 text-white flex justify-center items-center rounded-full text-sm"
          >
            {{ unreadNotificationsCount }}
          </span>
        </div>

        <!-- Notification Dropdown Content -->
        <div
          *ngIf="showNotifications"
          class="absolute right-0 top-full mt-2 w-96 bg-white border rounded-lg shadow-lg max-h-[500px] overflow-y-auto z-50"
        >
          <div class="p-4 border-b flex justify-between items-center">
            <h3 class="font-semibold text-lg">Notifications</h3>
            <button
              *ngIf="notifications.length > 0"
              (click)="clearNotifications()"
              class="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          </div>

          <div
            *ngIf="notifications.length === 0"
            class="p-4 text-center text-gray-500"
          >
            No notifications
          </div>

          <div
            *ngFor="let notification of notifications"
            (click)="openNotificationDetail(notification)"
            class="p-4 border-b hover:bg-gray-50 cursor-pointer flex items-start"
            [ngClass]="{ 'bg-blue-50': !notification.read }"
          >
            <img
              [src]="notification.sender.profile"
              alt="Sender"
              class="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <p
                class="text-sm font-medium"
                [innerHTML]="notification.message"
              ></p>
              <p class="text-xs text-gray-500">
                {{ formatTimestamp(notification.createdAt) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Logout Button -->
        <div class="flex items-center">
          <button
            class="text-sm bg-[#8B9F82]/20 border-none outline-none cursor-pointer px-10 py-2 rounded-md flex gap-2 hover:bg-[#8B9F82]/30"
            (click)="logout()"
          >
            Logout
            <fa-icon [icon]="faSignOut"></fa-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes ring-bell {
        0%,
        100% {
          transform: rotate(0deg);
        }
        25% {
          transform: rotate(-15deg);
        }
        50% {
          transform: rotate(15deg);
        }
        75% {
          transform: rotate(-10deg);
        }
      }
      .ringing {
        animation: ring-bell 0.7s ease-in-out infinite;
      }
    `,
  ],
})
export class HeaderComponent implements OnInit, OnDestroy {
 
  // Icons
  protected faSignOut = faSignOut;
  protected faBell = faBell;
  protected faUser = faUser;

  // User input
  @Input() user: any;

  // Notification management
  protected notifications: Notification[] = [];
  protected unreadNotificationsCount = 0;
  protected showNotifications = false;
  private readonly _toastService: ToastService = inject(ToastService);

  // Subscriptions
  private notificationSub: Subscription | null = null;
  private unreadCountSub: Subscription | null = null;
  private websocketSub: Subscription | null = null;

  constructor(
    private elementRef: ElementRef,
    private authService: AuthenticationService,
    private websocketService: WebsocketService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated().subscribe({
      next: (isAuthenticated) => {
        if (isAuthenticated) {
          this.subscribeToNotificationUpdates();
          this.subscribeToNotifications();
          this.initializeWebSocketConnection();
        }
      },
      error: (error) => {
        console.error('Error checking authentication status', error);
        this._toastService.show(error.error.message, 'DANGER', null);
      },
    });
  }

  ngOnDestroy(): void {
    this.notificationSub?.unsubscribe();
    this.unreadCountSub?.unsubscribe();
    this.websocketSub?.unsubscribe();
  }

  // Subscribe to notifications and unread count
  private subscribeToNotifications(): void {
    this.notificationService
      .getNotifications()
      .pipe(
        catchError((error) => {
          console.error('Error loading notifications', error);
          return of([]);
        })
      )
      .subscribe();
  }

  private subscribeToNotificationUpdates(): void {
    // Subscribe to notifications stream
    this.notificationSub = this.notificationService.notifications$.subscribe({
      next: (notifications) => {
        if (notifications.length > 0)
          this._toastService.show(
            'You have new notifications.',
            'SUCCESS',
            'NOTIFICATION'
          );
        this.notifications = notifications;
      },
      error: (error) => {
        console.error('Error in notifications stream', error);
      },
    });

    // Subscribe to unread count
    this.unreadCountSub = this.notificationService.unreadCount$.subscribe({
      next: (count) => {
        if (count > 0)
          this._toastService.show(
            `You have ${count} new notifications.`,
            'SUCCESS',
            'NOTIFICATION'
          );
        this.unreadNotificationsCount = count;
      },
      error: (error) => {
        console.error('Error in unread count stream', error);
      },
    });
  }

  // Initialize WebSocket connection
  private initializeWebSocketConnection(): void {
    if (!this.user?.email) return;

    this.websocketService
      .connect()
      .then(() => {
        this.joinUserTopic(this.user.email);

        // Subscribe to WebSocket notifications
        this.websocketSub = this.websocketService.getNotification().subscribe({
          next: (notification: Notification) => {
            this.notificationService.addWebSocketNotification(notification);
          },
          error: (error) =>
            console.error('WebSocket notification error:', error),
        });
      })
      .catch((error) => {
        console.error('WebSocket connection error:', error);
      });
  }

  // Join user-specific notification topic
  private joinUserTopic(email: string): void {
    this.websocketService.joinNotification(email);
  }

  // Toggle notifications dropdown
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  // Close notifications when clicking outside
  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showNotifications = false;
    }
  }

  // Format timestamp for readability
  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Open detailed view for a specific notification
  openNotificationDetail(notification: Notification): void {
    // Mark the specific notification as read
    this.notificationService
      .markNotificationAsRead(notification._id)
      .subscribe({
        next: () => {},
        error: (error) => {
          console.error('Error marking notification as read', error);
        },
      });
  }

  // Clear all notifications
  clearNotifications(): void {
    // If user is available, pass the user ID to clear notifications
    if (this.user?._id) {
      this.notificationService
        .markAllNotificationsAsRead(this.user._id)
        .subscribe({
          next: () => {
            console.log('All notifications cleared');
          },
          error: (error) => {
            console.error('Error clearing notifications', error);
          },
        });
    }
  }

  // Handle logout action
  logout(): void {
    this._toastService.show('Logged out successfully!', 'WARNING', null);
    this.websocketService.disconnect();
    this.authService.logout();
  }
}
