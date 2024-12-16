import { Component, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'ccnta-forget-password',
  template:  `

    <div
      class="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4"
    >
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-4">
        <div class="py-6 px-4">
          <svg
            class="mx-auto h-12 w-auto text-[#8B9F82]"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="2"
              ry="2"
              fill="currentColor"
            />
            <line x1="6" y1="8" x2="18" y2="8" stroke="white" stroke-width="1.5" />
            <line
              x1="6"
              y1="12"
              x2="18"
              y2="12"
              stroke="white"
              stroke-width="1.5"
            />
            <line
              x1="6"
              y1="16"
              x2="14"
              y2="16"
              stroke="white"
              stroke-width="1.5"
            />
            <path d="M20 3l1 1-7 7-1-1 7-7z" fill="white" />
            <path d="M19 4l1 1-1 1-1-1 1-1z" fill="white" />
          </svg>

          <h2 class="mt-4 text-center text-2xl font-bold text-gray-900">
            Forget your password?
          </h2>

          <form
            class="mt-6 space-y-4"
            #form="ngForm"
            (ngSubmit)="onSubmits(form)"
          >
            <div>
              <label
                for="email"
                class="block mb-2 text-sm font-medium"
                [ngClass]="{ 'text-red-700': email.invalid && email.touched }"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                [(ngModel)]="model.email"
                #email="ngModel"
                required
                minlength="3"
                class="border text-sm rounded-lg block w-full p-2 outline-none"
                [ngClass]="{
                  'bg-red-50 border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500':
                    email.invalid && email.touched
                }"
                placeholder="Email"
              />
              <div
                class="text-sm text-red-600 mt-1"
                *ngIf="email.invalid && email.touched"
              >
                <small *ngIf="email.errors?.['required']" class="font-semibold"
                  >* Email is required</small
                >
              </div>
            </div>

            <div>
              <button
                type="submit"
                [disabled]="form.form.invalid || isLoading"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-[#8B9F82] hover:bg-[#8B9F82]/95 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isLoading ? "Sending..." : "Request" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  `,
  styles: [],
})
export class ForgetPasswordComponent {
  private _router: Router = inject(Router);
  private _authenticationService: AuthenticationService = inject(
    AuthenticationService
  );

  model = {
    email: '',
  };

  isLoading = false;

  constructor(){
    this._authenticationService.isAuthenticated$
    .subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this._router.navigate(['/home']);
      }
    });
  }

  onSubmits(form: NgForm) {
    if (form.valid) {
      this.isLoading = true;

      this._authenticationService
        .forgetPasswordRequest(this.model.email)
        .subscribe({
          next: () => {
            this._router.navigate(['/auth/forget-password-request']);
          },
          error: (error) => {
            console.error('Error sending forget password request', error);
          },
          complete: () => {
            form.resetForm();
            this.isLoading = false;
          },
        });
    }
  }
}
