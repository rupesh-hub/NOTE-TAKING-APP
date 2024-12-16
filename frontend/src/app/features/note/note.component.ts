import { Component } from '@angular/core';

@Component({
  selector: 'ccnta-note',
  template: `
    <div class="mx-auto bg-white shadow-sm overflow-hidden rounded-md">
      <div class="flex border-b border-gray-200">
        <!-- Notes Link -->
        <button
          class="flex-1 py-3 px-4 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 group"
          data-tab="notes"
          routerLink="/home/notes"
          routerLinkActive="bg-[#8B9F82]/20 text-blue-500"
          [routerLinkActiveOptions]="{ exact: true }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-sticky-note"
          >
            <path
              d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"
            />
            <path d="M15 3v4a2 2 0 0 0 2 2h4" />
          </svg>
          Notes
        </button>

        <!-- Details Link -->
        <button
          class="flex-1 py-3 px-4 text-sm font-medium text-gray-600 transition-colors flex items-center justify-center gap-2 group cursor-not-allowed opacity-50"
          data-tab="details"
          [routerLink]="null"
          routerLinkActive="bg-[#8B9F82]/20 text-blue-500"
          pathMatch="full"
          disabled
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-info"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          Details
        </button>
      </div>

      <!-- Router Outlet -->
      <router-outlet></router-outlet>
    </div>
  `,
  styles: ``,
})
export class NoteComponent {}
