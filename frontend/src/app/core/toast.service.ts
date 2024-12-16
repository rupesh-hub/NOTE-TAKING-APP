import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastInfo {
  id: string;
  body: string;
  type: 'SUCCESS' | 'DANGER' | 'WARNING';
  title?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new Subject<ToastInfo>();
  toast$ = this.toastSubject.asObservable();
  private audio = new Audio();

  constructor() {
    this.audio.src = 'assets/notification.mp3';
    this.audio.load();
  }

  show(
    body: string,
    type: 'SUCCESS' | 'DANGER' | 'WARNING',
    messageFor: 'NOTIFICATION' | null,
    options: {
      title?: string;
      duration?: number;
    } = {}
  ) {
    if (messageFor === 'NOTIFICATION') {
      // Play the sound
      this.audio.play().catch((error) => {
        console.error('Error playing notification sound:', error);
      });
    }

    const id = Date.now().toString();
    const toast: ToastInfo = {
      id,
      body,
      type,
      title: options.title,
      duration: options.duration || 5000,
    };
    this.toastSubject.next(toast);
  }
}
