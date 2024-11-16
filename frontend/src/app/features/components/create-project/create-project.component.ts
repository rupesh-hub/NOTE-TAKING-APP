import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectService } from '../../services/project.service';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
  of,
} from 'rxjs';
import { Authority } from '../../../core/models/auth-model';
import { Router } from '@angular/router';

interface User {
  id?: string; // Update to match the ObjectId format
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profile: string;
}

interface Collaborator {
  userId: string;
  authority: string;
}

@Component({
  selector: 'app-create-project',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss'],
})
export class CreateProjectComponent implements OnInit, OnDestroy {
  @ViewChild('projectForm') projectForm!: NgForm;

  projectName: string = '';
  projectDeadline: string = '';
  searchText: string = '';
  assignedUsers: User[] = [];
  isDropdownOpen: boolean = false;
  filteredUsers: User[] = [];
  authorities: Authority[] = [];
  collaborators = new Map<string, Collaborator>();

  private authService: AuthService = inject(AuthService);
  private projectService: ProjectService = inject(ProjectService);
  private searchTerms = new Subject<string>();
  private destroy$ = new Subject<void>();
  private router = inject(Router);

  ngOnInit() {
    this.searchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term: string) =>
          term ? this.authService.filterUsers(1, 10, term) : of(null)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.authService.filteredUsers$
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        this.filteredUsers =
          response?.users?.map((user: any) => ({
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            profile:
              user.profile || 'https://c.stocksy.com/a/AXHD00/z9/3165668.jpg',
          })) || [];
      });

    // Load authorities once
    this.authService.getAuthorities().subscribe({
      next: (response: []) => {
        this.authorities = response;
      },
      error: (err) => console.error('Failed to load authorities:', err),
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(searchTerm: string) {
    this.searchTerms.next(searchTerm);
  }

  openDropdown(): void {
    this.isDropdownOpen = true;
    if (!this.filteredUsers.length)
      this.authService.filterUsers(1, 10).subscribe();
  }

  onDropdownBlur(): void {
    setTimeout(() => (this.isDropdownOpen = false), 200);
  }

  removeAssignedUser(user: User): void {
    this.assignedUsers = this.assignedUsers.filter((u) => u.id !== user.id);
    this.collaborators.delete(user.id!);
  }

  getFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  assignRole(user: User, authorityId: string) {
    if (user.id) {
      const collaborator = this.collaborators.get(user.id);
      if (collaborator) {
        collaborator.authority = authorityId;
      }
    }
  }

  toggleUserSelection(user: User): void {
    const existingIndex = this.assignedUsers.findIndex((u) => u.id === user.id);
    if (existingIndex > -1) {
      this.assignedUsers.splice(existingIndex, 1);
      this.collaborators.delete(user.id!);
    } else {
      this.assignedUsers.push(user);
      if (user.id) {
        this.collaborators.set(user.id, { userId: user.id, authority: '' });
      }
    }
    this.isDropdownOpen = false;
  }

  isUserSelected(user: User): boolean {
    return this.assignedUsers.some((u) => u.id === user.id);
  }

  saveProject(): void {
    const collaboratorsArray = Array.from(this.collaborators.values());
    this.projectService
      .saveProject(this.projectName, this.projectDeadline, collaboratorsArray)
      .subscribe({
        next: (response) => this.router.navigate(['/home']),
        error: (error) => console.error('Error saving project:', error),
      });
  }
}
