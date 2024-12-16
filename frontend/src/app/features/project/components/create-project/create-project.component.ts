import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';

// Services
import { ProjectService } from '../../project.service';
import { UserService } from '../../../user/user.service';
import { ToastService } from '../../../../core/toast.service';
import { HttpErrorResponse } from '@angular/common/http';

// Interfaces
interface User {
  name: string;
  email: string;
  profile: string;
}

interface Collaborator {
  email: string;
  authority: string;
}

@Component({
  selector: 'ccnta-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss'],
})
export class CreateProjectComponent implements OnInit, OnDestroy {
  projectForm: FormGroup;
  userAssignmentForm: FormGroup;

  // User search and selection
  filteredUsers: User[] = [];
  assignedUsers: User[] = [];
  collaborators = new Map<string, Collaborator>();

  // Dropdown and UI states
  isDropdownOpen = false;
  isSubmitting = false;

  // Predefined authorities
  authorities = [
    { id: 2, name: 'editor' },
    { id: 3, name: 'viewer' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private _projectService: ProjectService,
    private _userService: UserService,
    private _toastService: ToastService,
    private _router: Router
  ) {
    this.projectForm = this.fb.group({
      projectName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      projectDescription: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
    });

    this.userAssignmentForm = this.fb.group({
      userSearch: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|hotmail\.com|outlook\.com)$/
          ),
        ],
      ],
    });
  }

  ngOnInit(): void {
    // Listen to value changes for dynamic filtering
    this.userAssignmentForm
      .get('userSearch')
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        if (value && value.includes('@')) {
          this.searchUserByEmail();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Search user by email
  searchUserByEmail() {
    const email = this.userAssignmentForm.get('userSearch').value;

    // Only search if the email is valid
    if (this.userAssignmentForm.get('userSearch').valid) {
      this._userService.searchUserByEmail(email).subscribe({
        next: (response) => {
          if (response.success && response.user) {
            this.filteredUsers = [response.user];
            this.isDropdownOpen = true;
            this._toastService.show(`User <strong><i>'${response.user.name}'</i></strong> found.`, 'SUCCESS',null);
          } else {
            this.filteredUsers = [];
            this.isDropdownOpen = false;
            this._toastService.show('Failed to create project', 'DANGER', null);
          }
        },
        error: (error) => {
          this.filteredUsers = [];
          this.isDropdownOpen = false;
          this._toastService.show(`Oops error: ${error.error.message}`, 'DANGER', null);
        },
      });
    }
  }

  // Toggle user selection
  toggleUserSelection(user: User) {
    const index = this.assignedUsers.findIndex((u) => u.email === user.email);

    if (index === -1) {
      // Add user if not already assigned
      this.assignedUsers.push(user);
    } else {
      // Remove user if already assigned
      this.assignedUsers.splice(index, 1);
    }

    // Close dropdown after selection
    this.isDropdownOpen = false;

    // Reset search input
    this.userAssignmentForm.get('userSearch').setValue('');
  }

  // Remove assigned user
  removeAssignedUser(user: User) {
    const index = this.assignedUsers.findIndex((u) => u.email === user.email);
    if (index !== -1) {
      this.assignedUsers.splice(index, 1);
    }
  }

  // Check if user is selected
  isUserSelected(user: User): boolean {
    return this.assignedUsers.some((u) => u.email === user.email);
  }

  // Get full name of user
  getFullName(user: User): string {
    return user.name;
  }

  // Assign role to user
  assignRole(user: User, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const authority = selectElement.value;

    // Add or update collaborator with selected role
    this.collaborators.set(user.email, {
      email: user.email, // Using email as userId
      authority: authority,
    });
  }

  // Form Submission
  saveProject(): void {
    if (this.projectForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const collaboratorsArray = Array.from(this.collaborators.values());

    const projectData = {
      title: this.projectForm.value.projectName,
      description: this.projectForm.value.projectDescription,
      collaborators: collaboratorsArray,
    };

    this._projectService.create(projectData).subscribe({
      next: (response) => {
        if (response.success) {
          this._toastService.show('Project created successfully', 'SUCCESS', null);
          this._router.navigate(['/home']);
        } else {
          this._toastService.show('Failed to create project', 'DANGER', null);
        }
      },
      error: (error: HttpErrorResponse) => {
        this._toastService.show(error.error.message, 'DANGER', null);
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
    this.isSubmitting = false;
  }

  // Form Validation Helpers
  get projectName() {
    return this.projectForm.get('projectName');
  }
  get projectDescription() {
    return this.projectForm.get('projectDescription');
  }
}
