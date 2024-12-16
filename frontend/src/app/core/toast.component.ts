import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastInfo, ToastService } from './toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ccnta-toast',
  template: `
    <div class="toast-container fixed top-4 right-4 z-50">
      <div
        *ngFor="let toast of toasts"
        [id]="'toast-' + toast.type.toLowerCase()"
        class="flex items-center w-full max-w-md p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800 animate-slide-in"
        [ngClass]="getToastClass(toast.type)"
        role="alert"
      >
        <div
          class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg"
          [ngClass]="getIconClass(toast.type)"
        >
          <svg
            class="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path [attr.d]="getIconPath(toast.type)" />
          </svg>
        </div>
        <div class="ms-3 text-sm font-normal font-serif" [innerHTML]="toast.body"></div>
        <button
          type="button"
          class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
          (click)="removeToast(toast)"
          aria-label="Close"
        >
          <svg
            class="w-3 h-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .animate-slide-in {
        animation: slide-in 0.3s ease-out;
      }
      @keyframes slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `,
  ],
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastInfo[] = [];
  private toastSubscription: Subscription;
  private readonly MAX_TOASTS = 3; // Limit number of visible toasts

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastSubscription = this.toastService.toast$.subscribe((toast) => {
      // Remove oldest toast if max limit is reached
      if (this.toasts.length >= this.MAX_TOASTS) {
        this.toasts.shift();
      }

      this.toasts.push(toast);

      // Auto-remove the toast after 5 seconds
      setTimeout(() => this.removeToast(toast), 5000);
    });
  }

  ngOnDestroy() {
    // Prevent memory leaks
    this.toastSubscription?.unsubscribe();
  }

  removeToast(toast: ToastInfo) {
    this.toasts = this.toasts.filter((t) => t.id !== toast.id);
  }

  // Existing methods (getToastClass, getIconClass, getIconPath) remain the same
  getToastClass(type: 'SUCCESS' | 'DANGER' | 'WARNING') {
    const classes = {
      SUCCESS:
        'text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200',
      DANGER: 'text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200',
      WARNING:
        'text-orange-500 bg-orange-100 dark:bg-orange-700 dark:text-orange-200',
    };
    return classes[type];
  }

  getIconClass(type: 'SUCCESS' | 'DANGER' | 'WARNING') {
    const classes = {
      SUCCESS: 'bg-green-100 dark:bg-green-800 dark:text-green-200',
      DANGER: 'bg-red-100 dark:bg-red-800 dark:text-red-200',
      WARNING: 'bg-orange-100 dark:bg-orange-700 dark:text-orange-200',
    };
    return classes[type];
  }

  getIconPath(type: 'SUCCESS' | 'DANGER' | 'WARNING') {
    const paths = {
      SUCCESS:
        'M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z',
      DANGER:
        'M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z',
      WARNING:
        'M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z',
    };
    return paths[type];
  }
}
