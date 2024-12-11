import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'nta-forget-password',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule, ReactiveFormsModule],
  template: `
  <div
      class="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8"
    >
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        
        <!-- LOGO -->
        <svg class="mx-auto h-12 w-auto text-[#8B9F82]" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <!-- Notebook Shape -->
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="currentColor" />
          <!-- Lines for Notes -->
          <line x1="6" y1="8" x2="18" y2="8" stroke="white" stroke-width="1.5" />
          <line x1="6" y1="12" x2="18" y2="12" stroke="white" stroke-width="1.5" />
          <line x1="6" y1="16" x2="14" y2="16" stroke="white" stroke-width="1.5" />
          <!-- Pen Icon -->
          <path d="M20 3l1 1-7 7-1-1 7-7z" fill="white" />
          <path d="M19 4l1 1-1 1-1-1 1-1z" fill="white" />
        </svg>

        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-600">
          Setup your new password
        </h2>
      </div>

      <div class="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-sm sm:rounded-md sm:px-10">
          <form
            class="space-y-6"
            #loginForm="ngForm"
            (ngSubmit)="onSubmits(loginForm)"
          >
            <div class="mb-6">
              <label
                for="username"
                class="block mb-2 text-sm font-medium"
                [ngClass]="{
                  'text-red-700 dark:text-red-500':
                    username.invalid && username.touched
                }"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                [(ngModel)]="model.username"
                #username="ngModel"
                required
                minlength="3"
                class="border text-sm rounded-lg block w-full p-2.5 focus:outline-none outline-none"
                [ngClass]="{
                  'bg-red-50 border-red-500 text-red-900 placeholder-red-700':
                    username.invalid && username.touched
                }"
                placeholder="Username"
              />
              <div
                class="error-messages text-sm text-red-600 dark:text-red-500"
                *ngIf="username.invalid && username.touched"
              >
                <small *ngIf="username.errors?.['required']" class="font-semibold">
                  * Username is required
                </small>
              </div>
            </div>

            <div class="mb-6">
              <label
                for="password"
                class="block mb-2 text-sm font-medium"
                [ngClass]="{
                  'text-red-700 dark:text-red-500':
                    password.invalid && password.touched
                }"
              >
                Password
              </label>

              <div class="relative">
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  id="password"
                  name="password"
                  [(ngModel)]="model.password"
                  #password="ngModel"
                  required
                  minlength="8"
                  class="border text-sm rounded-lg block w-full p-2.5 focus:outline-none outline-none"
                  [ngClass]="{
                    'bg-red-50 border-red-500 text-red-900 dark:text-red-400 placeholder-red-700':
                      password.invalid && password.touched
                  }"
                  placeholder="Password"
                />
                <button
                  type="button"
                  class="password-toggle absolute inset-y-0 right-0 pr-3 flex items-center"
                  (click)="togglePasswordVisibility()"
                  [attr.aria-label]="
                    showPassword ? 'Hide password' : 'Show password'
                  "
                >
                  @if(showPassword){
                  <fa-icon [icon]="faEyeSlash" class="text-gray-500"></fa-icon>
                  }@else {
                  <fa-icon [icon]="faEye" class="text-gray-500"></fa-icon>
                  }
                </button>
              </div>
              <div
                class="error-messages text-sm text-red-600 dark:text-red-500"
                *ngIf="password.invalid && password.touched"
              >
                <small
                  *ngIf="password.errors?.['required']"
                  class="font-semibold"
                >
                  * Password is required
                </small>
                <small
                  *ngIf="password.errors?.['minlength']"
                  class="font-semibold"
                >
                  * Minimum 8 characters.
                </small>
              </div>
            </div>

            <div class="mb-6">
              <label
                for="confirmPassword"
                class="block mb-2 text-sm font-medium"
                [ngClass]="{
                  'text-red-700 dark:text-red-500':
                    confirmPassword.invalid && confirmPassword.touched
                }"
              >
                Confirm Password
              </label>

              <div class="relative">
                <input
                  [type]="showPasswordConfirm ? 'text' : 'password'"
                  id="confirmPassword"
                  name="confirmPassword"
                  [(ngModel)]="model.confirmPassword"
                  #confirmPassword="ngModel"
                  required
                  minlength="8"
                  class="border text-sm rounded-lg block w-full p-2.5 focus:outline-none outline-none"
                  [ngClass]="{
                    'bg-red-50 border-red-500 text-red-900 dark:text-red-400 placeholder-red-700':
                      confirmPassword.invalid && confirmPassword.touched
                  }"
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  class="password-toggle absolute inset-y-0 right-0 pr-3 flex items-center"
                  (click)="toggleConfirmPasswordVisibility()"
                  [attr.aria-label]="
                    showPasswordConfirm ? 'Hide password' : 'Show password'
                  "
                >
                  @if(showPasswordConfirm){
                  <fa-icon [icon]="faEyeSlash" class="text-gray-500"></fa-icon>
                  }@else {
                  <fa-icon [icon]="faEye" class="text-gray-500"></fa-icon>
                  }
                </button>
              </div>
              <div
                class="error-messages text-sm text-red-600 dark:text-red-500"
                *ngIf="confirmPassword.invalid && confirmPassword.touched"
              >
                <small
                  *ngIf="confirmPassword.errors?.['required']"
                  class="font-semibold"
                >
                  * Confirm Password is required
                </small>
                <small
                  *ngIf="confirmPassword.errors?.['minlength']"
                  class="font-semibold"
                >
                  * Minimum 8 characters. ]</small
                >
              </div>
            </div>

            <div>
              <button
                type="submit"
                [disabled]="loginForm.form.invalid || isLoading"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#8B9F82] hover:bg-[#8B9F82]/95 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed outline-none"
              >
                {{ isLoading ? 'Requesting...' : 'Reset password' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  
  `,
  styles: []
})
export class ForgetPasswordComponent {

  private _router:Router = inject(Router);

  faEyeSlash = faEyeSlash;
  faEye = faEye;

  model = {
    username: '',
    password: '',
    confirmPassword: '',
  };

  isLoading = false;
  showPassword = false;
  showPasswordConfirm = false;

  onSubmits(form: NgForm) {
    if (form.valid) {
      this.isLoading = true;
      console.log(this.model);
      setTimeout(() => {
        this.isLoading = false;
      }, 1000);

      this._router.navigate(['/authentication'])
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showPasswordConfirm = !this.showPasswordConfirm;
  }

}
