import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'nta-forget-password-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
class="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8"
>
  <div class="sm:mx-auto sm:w-full sm:max-w-md">
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
      
    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
      Forget your password?
    </h2>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <form class="space-y-6" #loginForm="ngForm" (ngSubmit)="onSubmits(loginForm)">
        <div class="mb-6">
          <label for="username" class="block mb-2 text-sm font-medium" 
                 [ngClass]="{'text-red-700 dark:text-red-500': username.invalid && username.touched}">
            Username/Email
          </label>
          <input 
            type="text" 
            id="username" 
            name="username"
            [(ngModel)]="model.username"
            #username="ngModel"
            required
            minlength="3"
            class="border text-sm rounded-lg block w-full p-2.5 outline-none" 
            [ngClass]="{'bg-red-50 border-red-500 text-red-900 dark:text-red-400 placeholder-red-700 dark:placeholder-red-500 focus:ring-red-500 focus:border-red-500': username.invalid && username.touched}"
            placeholder="Username Or Email">
          <div class="error-messages text-sm text-red-600 dark:text-red-500" *ngIf="username.invalid && username.touched">
            <small *ngIf="username.errors?.['required']" class="font-semibold">* Username/Email is required</small>
          </div>
        </div>

        <div>
          <button 
            type="submit"
            [disabled]="loginForm.form.invalid || isLoading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#8B9F82] hover:bg-[#8B9F82]/95 focus:outline-none outline-none disabled:opacity-50 disabled:cursor-not-allowed">
            {{ isLoading ? 'Sending...' : 'Request' }}
          </button>
        </div>
      </form>

    </div>
  </div>
</div>
  `,
  styles: ``
})
export class ForgetPasswordRequestComponent {

  private _router:Router = inject(Router);

  model = {
    username: ''
  };

  isLoading = false;


  onSubmits(form: NgForm) {
    if (form.valid) {
      this.isLoading = true;
      console.log(this.model);
      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
      this._router.navigate(['/valiate-token'])

    }
  }

}
