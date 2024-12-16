import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  public socket: Socket | null = null;
  private connected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // Subjects for emitting events to subscribers
  private noteUpdatedSubject = new Subject<any>();
  private userJoinedSubject = new Subject<any>();
  private topicNotificationSubject = new Subject<any>();
  private reviewSubject = new Subject<any>();

  constructor() {}

  // Initialize WebSocket connection
  connect(): Promise<void> {
    if (this.connected) {
      return Promise.resolve();
    }

    this.socket = io('http://localhost:3000', {
      transports: ['websocket'],
      autoConnect: false,
      withCredentials: true,
      auth: {
        token: this.getAuthToken(),
      },
    });

    return new Promise<void>((resolve, reject) => {
      this.socket?.connect();

      this.socket?.once('connect', () => {
        this.connected = true;
        this.reconnectAttempts = 0;
        console.log('Connected to WebSocket server');
        this.setupSocketListeners();
        resolve();
      });

      this.socket?.once('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        reject(error);
      });
    });
  }

  // Disconnect WebSocket connection
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.connected = false;
      console.log('Disconnected from WebSocket server');
    }
  }

  // Setup listeners for WebSocket events
  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.connected = false;
      this.reconnect();
    });

    this.socket.on('note-updated', (data: any) => {
      console.log('Note updated:', data);
      this.noteUpdatedSubject.next(data);
    });

    this.socket.on('update-error', (error: any) => {
      console.error('Note update error:', error);
    });

    this.socket.on('user-joined', (data: any) => {
      console.log('User joined:', data);
      this.userJoinedSubject.next(data);
    });

    this.socket.on('collaborator-action', (data: any) => {
      this.topicNotificationSubject.next(data);
    });

    // comment / review
    this.socket.on('review-action', (data: any) => {
      this.reviewSubject.next(data);
    });
  }

  // Join a project room
  joinProject(projectId: string): void {
    if (!this.socket) {
      console.error('WebSocket is not initialized');
      return;
    }
    this.socket.emit('join-project', projectId);
    console.log(`Joined project room: ${projectId}`);
  }

  // Emit a note update to the server
  sendNoteUpdate(noteId: string, projectId: string, updates: any): void {
    if (!this.socket) {
      console.error('WebSocket is not initialized');
      return;
    }

    this.socket.emit('note-update', { noteId, projectId, updates });
    console.log('Note update sent:', { noteId, projectId, updates });
  }

  // Observable to subscribe to note updates
  getNoteUpdates(): Observable<any> {
    return this.noteUpdatedSubject.asObservable();
  }

  // Observable to subscribe to user joined events
  getUserJoined(): Observable<any> {
    return this.userJoinedSubject.asObservable();
  }

  // Reconnect logic with limited attempts
  private reconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
      );

      setTimeout(() => {
        this.connect()
          .then(() => {
            console.log('Reconnected successfully');
          })
          .catch(() => {
            this.reconnect();
          });
      }, 5000);
    } else {
      console.error('Maximum reconnection attempts reached');
    }
  }

  // Get authentication token (example)
  private getAuthToken(): string {
    return localStorage.getItem('token') || '';
  }

  // Observable to subscribe to notifications for a specific topic
  getNotification(): Observable<any> {
    return this.topicNotificationSubject.asObservable();
  }

  joinNotification(topic: string): void {
    if (!this.socket) {
      console.error('WebSocket is not initialized');
      return;
    }
    this.socket.emit('join-topic', topic);
  }

  joinReview(noteId: string): void {
    if (!this.socket) {
      console.error('WebSocket is not initialized');
      return;
    }
    this.socket.emit('join-review', noteId);
  }

  getReview(): Observable<any> {
    return this.reviewSubject.asObservable();
  }

}
