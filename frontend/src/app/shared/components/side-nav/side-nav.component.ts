import { Component, EventEmitter, Input, Output, inject } from '@angular/core';

import {
  faHome,
  faSearch,
  faArrowUp,
  faAngleDown,
  faAngleUp,
  faSignOutAlt,
  faPlus,
  faEdit,
  faKey,
  faUserCircle,
  faBars,
} from '@fortawesome/free-solid-svg-icons';

import {
  faNoteSticky,
  faCheckCircle,
  faQuestionCircle,
  faStar,
  faFolder,
  faUser,
  faImage,
} from '@fortawesome/free-regular-svg-icons';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { ProjectService } from '../../../features/project/project.service';

@Component({
  selector: 'ccnta-side-nav',
  template: `
    <aside
      class="fixed left-0 top-0 h-full bg-white flex flex-col border-r overflow-hidden transition-all duration-300 ease-in-out"
      [ngClass]="{
        'w-74': isExpanded,
        'w-20': !isExpanded
      }"
    >
      <!-- Hamburger/Close Button -->
      <div
        class="p-4 border-b border-gray-200 flex justify-between items-center"
      >
        <button
          (click)="onToggle()"
          class="focus:outline-none flex items-center justify-center w-full"
        >
          <fa-icon [icon]="faBars" class="text-gray-600" />
        </button>
      </div>

      <!-- Top Section -->
      <div
        class="p-4 border-b border-gray-200 cursor-pointer transition-opacity duration-300 ease-in-out flex items-center"
        routerLink="/home/users"
      >
        <div class="flex items-center space-x-4">
          <img
            [src]="authenticatedUser.profile"
            [alt]="authenticatedUser.name"
            class="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
          <div
            class="min-w-0 flex-grow transition-opacity duration-300 ease-in-out"
            [ngClass]="{
              'opacity-0 hidden': !isExpanded,
              'opacity-100': isExpanded
            }"
          >
            <h3 class="font-semibold text-gray-800 truncate">
              {{ authenticatedUser.name }}
            </h3>
            <p class="text-sm text-[#8B9F82] truncate">
              {{ authenticatedUser.email }}
            </p>
          </div>
        </div>
      </div>

      <!-- Main Navigation -->
      <div class="flex-grow py-6 space-y-2 relative">
        <div class="px-4 pb-4">
          <!-- Create Project Button -->
          <button
            class="w-full border border-dashed border-[#8B9F82]/50 text-[#8B9F82] py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            routerLink="/home/projects/create"
            [ngClass]="{
              'flex-col': !isExpanded,
              'flex-row': isExpanded
            }"
          >
            <fa-icon [icon]="faPlus" class="text-sm" />
            <span
              class="transition-opacity duration-300 ease-in-out text-center"
              [ngClass]="{
                'opacity-0 hidden': !isExpanded,
                'opacity-100': isExpanded
              }"
            >
              New Project
            </span>
          </button>

          <!-- Main Navigation Links -->
          <nav class="space-y-2 mt-4">
            <a
              *ngFor="let item of mainNavItems"
              [routerLink]="item.link"
              routerLinkActive="bg-[#8B9F82]/20 text-[#8B9F82]"
              [routerLinkActiveOptions]="{ exact: item.exactMatch }"
              class="group relative h-[45px] flex items-center justify-between transition-colors rounded-lg text-gray-600 hover:bg-[#8B9F82]/15 px-3"
              [title]="item.label"
            >

              <div class="flex items-center space-x-3">
                <fa-icon [icon]="item.icon" />
                <span
                  class="ml-2 transition-opacity duration-300 ease-in-out"
                  [ngClass]="{
                    'opacity-0 hidden': !isExpanded,
                    'opacity-100': isExpanded
                  }"
                >
                  {{ item.label }}
                </span>
              </div>

              <div class="text-sm"
              [ngClass]="{
                    'opacity-0 hidden': !isExpanded,
                    'opacity-100': isExpanded
                  }">
                @if(item.badge){
                <span
                  class="text-[11px] font-semibold text-[#8B9F82] border border-dotted border-[#8B9F82] bg-[#8B9F82]/20 h-5 w-10 flex justify-center items-center rounded-xl"
                  >{{ item.badge }}</span
                >
                }
              </div>
            </a>
          </nav>
        </div>

        <!-- Projects Section -->
        <div class="pt-6 border-t px-4">
          <div
            class="flex justify-between items-center mb-4 transition-opacity duration-300 ease-in-out"
            [ngClass]="{
              'opacity-0 hidden': !isExpanded,
              'opacity-100': isExpanded
            }"
          >
            <div class="flex items-center space-x-2 text-gray-700">
              <fa-icon [icon]="faFolder" class="flex-shrink-0" />
              <span class="font-semibold">Projects</span>
            </div>
            <button class="text-gray-500 hover:text-gray-700">
              <fa-icon [icon]="faCaretSquareUp" />
            </button>
          </div>

          <!-- Scrollable Project List -->
          <div
            [class]="
              isExpanded
                ? 'max-h-52 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-[#8B9F82] scrollbar-track-gray-100'
                : 'overflow-hidden'
            "
          >
            <a
              *ngFor="let project of projects"
              (click)="navigateToProject(project._id)"
              class="text-sm flex items-center mb-1 px-3 py-2 rounded-md text-gray-600 hover:bg-[#8B9F82]/15 cursor-pointer"
              [ngClass]="{
                'justify-start': isExpanded,
                'justify-center border border-dashed border-gray-300':
                  !isExpanded
              }"
              [title]="project.title"
            >
              <span
                class="w-3 h-3 rounded-full bg-[#8B9F82] inline-block"
              ></span>
              <span
                class="ml-2 text-gray-400 italic text-sm transition-opacity duration-300 ease-in-out"
                [ngClass]="{
                  'opacity-0 hidden': !isExpanded,
                  'opacity-100': isExpanded
                }"
              >
                {{ project.title | truncate : 25 }}
              </span>
            </a>
          </div>
        </div>
      </div>

      <!-- Bottom Navigation -->
      <div class="border-t border-gray-200 p-4">
        <nav class="space-y-2">
          <a
            *ngFor="let item of bottomNavItems"
            [routerLink]="item.link"
            routerLinkActive="bg-gray-100 text-[#8B9F82]"
            class="flex items-center px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            [ngClass]="{
              'space-x-3': isExpanded,
              'justify-center border border-dashed border-gray-300': !isExpanded
            }"
            [title]="item.label"
          >
            <fa-icon [icon]="item.icon" class="flex-shrink-0" />
            <span
              class="ml-2 transition-opacity duration-300 ease-in-out"
              [ngClass]="{
                'opacity-0 hidden': !isExpanded,
                'opacity-100': isExpanded
              }"
            >
              {{ item.label }}
            </span>
          </a>
        </nav>
      </div>
    </aside>
  `,
  styles: [
    `
      .group .collapsed-icon {
        border: 1px dashed #8b9f82;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class SideNavComponent {
  // Icons remain the same as in the original component
  protected faPlus = faPlus;
  protected faHome = faHome;
  protected faSearch = faSearch;
  protected faNoteSticky = faNoteSticky;
  protected faCheckCircle = faCheckCircle;
  protected faFolder = faFolder;
  protected faArrowUp = faArrowUp;
  protected faQuestionCircle = faQuestionCircle;
  protected faStarHalfAlt = faStar;
  protected faCaretSquareUp = faAngleUp;
  protected faCaretSquareDown = faAngleDown;
  protected faSignOutAlt = faSignOutAlt;
  protected faUser = faUser;
  protected faEdit = faEdit;
  protected faKey = faKey;
  protected faUserCircle = faUserCircle;
  protected faImage = faImage;
  protected faBars = faBars;

  protected _authenticationService: AuthenticationService = inject(
    AuthenticationService
  );
  private _projectService: ProjectService = inject(ProjectService);
  private router: Router = inject(Router);

  @Input('authenticatedUser') authenticatedUser: any;

  // Use Angular signal for reactive expansion state
  // protected isExpanded = signal(false);

  projects: any;

  ngOnInit(): void {
    this.loadProjects();
  }

  @Input() isExpanded: boolean = true;
  @Output() toggle = new EventEmitter<void>();

  onToggle() {
    this.toggle.emit();
  }

  // Existing methods remain the same
  protected navigateToNote(projectId: string): void {
    this.router.navigate([`/notes/${projectId}`]);
  }

  protected loadProjects(): void {
    this._projectService.getAll().subscribe({
      next: (response: any) => {
        this.projects = response.projects;
      },
      error: (error: any) => console.error('Error retrieving projects:', error),
    });
  }

  protected navigateToProject(projectId: string): void {
    localStorage.setItem('projectId', projectId);
    this.router.navigate([`/home/projects/${projectId}`]);
  }

  // Main navigation items remain the same
  mainNavItems = [
    {
      icon: this.faHome,
      label: 'Home',
      link: '/home',
      exactMatch: true,
      badge: 'New',
    },
    {
      icon: this.faCheckCircle,
      label: 'Notes',
      link: '/home/notes',
      badge: '13',
      exactMatch: false,
    },
    {
      icon: this.faUser,
      label: 'Profile',
      link: '/home/users/profile',
      badge: 'New',
      exactMatch: true,
    },
  ];

  // Bottom navigation items remain the same
  bottomNavItems = [
    { icon: this.faQuestionCircle, label: 'Support', link: '/support' },
    { icon: this.faStarHalfAlt, label: "What's new", link: '/whats-new' },
    {
      icon: this.faSignOutAlt,
      label: 'Logout',
      link: null,
      action: () => this._authenticationService.logout(),
    },
  ];
}
