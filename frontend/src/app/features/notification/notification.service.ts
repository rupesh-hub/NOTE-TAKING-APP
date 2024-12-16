import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface Project {
  _id: string;
  title: string;
}

export interface Receiver {
  _id: string;
  name: string;
  email: string;
  profile: string;
}

export interface Sender {
  _id: string;
  name: string;
  email: string;
  profile: string;
}

export interface Notification {
  _id: string;
  project: Project;
  message: string;
  createdAt: string;
  read: boolean;
  receiver: Receiver;
  sender: Sender;
}

export interface NotificationResponse {
  message: string;
  notifications: Notification[];
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = `${environment.API_URL}/notifications`;

  private _notifications = new BehaviorSubject<Notification[]>([]);
  private _unreadCount = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {
  }

  get notifications$() {
    return this._notifications.asObservable();
  }

  get unreadCount$() {
    return this._unreadCount.asObservable();
  }

  public addNotification(
    project: string,
    message: string,
    receiver: string,
    sender: string
  ): Observable<Notification> {
    const notificationData = {
      project,
      message,
      receiver,
      sender,
    };

    return this.http
      .post<Notification>(`${this.apiUrl}/add`, notificationData)
      .pipe(
        tap((newNotification) => {
          const currentNotifications = this._notifications.value;
          this._notifications.next([newNotification, ...currentNotifications]);
          this.updateUnreadCount();
        })
      );
  }

  public removeNotification(notificationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove/${notificationId}`).pipe(
      tap(() => {
        const currentNotifications = this._notifications.value;
        const updatedNotifications = currentNotifications.filter(
          (n) => n._id !== notificationId
        );
        this._notifications.next(updatedNotifications);
        this.updateUnreadCount();
      })
    );
  }

  public getNotifications(): Observable<Notification[]> {
    return this.http.get<NotificationResponse>(`${this.apiUrl}`).pipe(
      map((response) => response.notifications || []),
      tap((notifications) => {
        const sortedNotifications = notifications.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this._notifications.next(sortedNotifications);
        this.updateUnreadCount();
      }),
      catchError((error) => {
        console.error('Error fetching notifications', error);
        this._notifications.next([]);
        this._unreadCount.next(0);
        return of([]);
      })
    );
  }

  public markNotificationAsRead(
    notificationId: string
  ): Observable<Notification> {
    return this.http
      .put<Notification>(`${this.apiUrl}/${notificationId}/read`, {
        read: true,
      })
      .pipe(
        tap((updatedNotification:any) => {
          const currentNotifications = this._notifications.value;
          const updatedNotifications = currentNotifications.map((n) =>
            n._id === notificationId ? updatedNotification.notification : n
          );
          this._notifications.next(updatedNotifications);
          this.updateUnreadCount();
        })
      );
  }

  public markAllNotificationsAsRead(userId: string): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/mark-all/${userId}`, { read: true })
      .pipe(
        tap(() => {
          const currentNotifications = this._notifications.value;
          const updatedNotifications = currentNotifications.map((n) => ({
            ...n,
            read: true,
          }));
          this._notifications.next(updatedNotifications);
          this._unreadCount.next(0);
        })
      );
  }

  public addWebSocketNotification(notification: Notification): void {
    const currentNotifications = this._notifications.value;
    // Check if notification already exists to prevent duplicates
    const isDuplicate = currentNotifications.some(
      (n) => n._id === notification._id
    );

    if (!isDuplicate) {
      this._notifications.next([notification, ...currentNotifications]);
      this.updateUnreadCount();
    }
  }

  private updateUnreadCount(): void {
    const unreadCount = this._notifications.value.filter((n) => !n.read).length;
    this._unreadCount.next(unreadCount);
  }

  public clearNotifications(): void {
    this._notifications.next([]);
    this._unreadCount.next(0);
  }
}
