import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../../../../core/services/authentication.service';

import {
  faFolder,
  faStickyNote,
  faEdit,
  faImage,
} from '@fortawesome/free-regular-svg-icons';
import { UserService } from '../../user.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../../core/toast.service';

@Component({
  selector: 'ccnta-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrl: './view-profile.component.scss',
})
export class ViewProfileComponent {
  constructor(
    private _userService: UserService,
    private _router: Router,
    private _authenticationService: AuthenticationService,
    private _toastService: ToastService
  ) {}

  protected userProfile: any = null;
  protected editedProfile: any = null;

  // Icons
  protected faFolder = faFolder;
  protected faStickyNote = faStickyNote;
  protected faEdit = faEdit;
  protected faImage = faImage;

  // State management
  protected isChangePasswordRequested = false;
  protected isEditing = false;

  // Projects from API response
  protected ownProjects: any[] = [];
  protected assignedProjects: any[] = [];

  public ngOnInit(): void {
    // Fetch user profile and projects
    this._userService.profile().subscribe({
      next: (response: any) => {
        this.userProfile = response.data.profile;
        this.ownProjects = response.data.createdProjects || [];
        this.assignedProjects = response.data.collaboratedProjects || [];
      },
      error: (error: any) => {
        console.error('Profile fetch error:', error);
      },
    });
  }

  protected startEditing() {
    this.editedProfile = { ...this.userProfile };
    this.isEditing = true;
  }

  protected cancelEditing() {
    this.isEditing = false;
    this.editedProfile = null;
  }

  protected saveProfile = () => {
    if (this.validateProfile(this.editedProfile)) {
      this._userService.updateProfile(this.editedProfile).subscribe({
        next: (response: any) => {
          this._toastService.show('Profile has been updated successfully!', 'SUCCESS', null)
          this.userProfile = response.user;
          this._authenticationService.authenticatedUser$.next({
            name: this.userProfile.name,
            email: this.userProfile.email,
            profile: this.userProfile.profile,
          });
          localStorage.setItem('name', this.userProfile.name);
          this.isEditing = false;
        },
        error: (error: any) => {
          console.error('Profile update error:', error);
        },
      });
    }
  };

  protected onFileSelected = (event: any) => {
    const file: File = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profile', file);

      this._userService.uploadProfilePicture(formData).subscribe({
        next: (response: any) => {
          if(response.success) this._toastService.show('Profile image has been changed successfully!', 'SUCCESS', null)
          this.userProfile.profile = response.profile;
          localStorage.setItem('profile', response.profile);
          this._authenticationService.authenticatedUser$.next({
            name: this.userProfile.name,
            email: this.userProfile.email,
            profile: this.userProfile.profile,
          });
        },
        error: (error: any) => {
          this._toastService.show(error.error.message, 'DANGER', null)
        },
      });
    }
  };

  private validateProfile(profile: any): boolean {
    return !!(
      profile?.firstName?.trim() &&
      profile?.lastName?.trim() &&
      profile?.email?.trim()
    );
  }

  protected changePasswordRequest = (): void => {
    this.isChangePasswordRequested = true;
    this._userService.changePasswordRequest().subscribe({
      next: () => {
        this.isChangePasswordRequested = false;
        this._toastService.show(`Email has been sent to you. Please check!`, 'SUCCESS', null);
      },
      error: (error: any) => {
        this._toastService.show(`${error.error.message}`, 'DANGER', null);
      },
    });
  };
}
