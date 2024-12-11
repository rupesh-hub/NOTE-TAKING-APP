import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import {
  faHome,
  faSearch,
  faArrowUp,
  faAngleDown,
  faAngleUp,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';

import {
  faNoteSticky,
  faCheckCircle,
  faQuestionCircle,
  faStar,
  faFolder,
  faPlusSquare,
  faUser
} from '@fortawesome/free-regular-svg-icons';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectService } from '../../../features/services/project.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'nta-side-nav',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterModule],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
})
export class SideNavComponent implements OnInit {
  protected faPlus = faPlusSquare;
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

  private authService: AuthService = inject(AuthService);
  private projectService: ProjectService = inject(ProjectService);
  private router: Router = inject(Router);

  authenticatedUser: any;
  projects: any;

  ngOnInit(): void {
    this.authenticatedUser = this.authService.authenticatedUser();
    this.projectService.viewAllProjects().subscribe({
      next: (response: any) => {
        this.projects = response;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }

  navigateToEditor() {
    this.router.navigate(['/editor']);
  }

  navigateToCreateProject() {
    this.router.navigate(['/projects/create']);
  }

  logout() {
    this.authService.logout();
  }

  protected navigateToNote(projectId: string): void {
    this.router.navigate([`/notes/${projectId}`]);
  }


  // Main navigation items
  mainNavItems = [
    { icon: this.faSearch, label: 'Search', link: '/search' },
    { 
      icon: this.faHome, 
      label: 'Home', 
      link: '/home',
      svgIcon: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none" stroke="currentColor" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" style="height: 14px; width: 14px">
          <path d="M256 48l-192 192v224a48 48 0 0 0 48 48h128V320h128v192h128a48 48 0 0 0 48-48V240L256 48z"/>
        </svg>
      `
    },
    { icon: this.faCheckCircle, label: 'Tasks', link: '/tasks' },
    { icon: this.faUser, label: 'Profile', link: '/profile' },
  ];

  // Bottom navigation items
  bottomNavItems = [
    { icon: this.faQuestionCircle, label: 'Support', link: '/support' },
    { icon: this.faStarHalfAlt, label: "What's new", link: '/whats-new' },
    { 
      icon: this.faSignOutAlt, 
      label: 'Logout', 
      link: null, // No navigation
      action: () => this.logout() // Callback function
    }
  ];

}
