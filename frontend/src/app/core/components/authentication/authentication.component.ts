import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'nta-authentication',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
<!-- login.component.html -->
<div class="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4">
  <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">


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

    <h2 class="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>
    
    <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-4">
      <!-- Username Field -->
      <div>
        <label for="username" class="block text-sm font-medium text-gray-700 mb-2">Username</label>
        <input 
          type="text" 
          id="username" 
          formControlName="username"
          placeholder="Enter your username"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1"
          [ngClass]="loginForm.get('username')?.invalid && (loginForm.get('username')?.dirty || loginForm.get('username')?.touched)?'border-red-400 focus:ring-red-500':'focus:ring-green-400'"
        >
        <small 
          *ngIf="loginForm.get('username')?.invalid && (loginForm.get('username')?.dirty || loginForm.get('username')?.touched)"
          class="text-red-500 text-xs mt-1"
        >
          Username is required
        </small>
      </div>

      <!-- Password Field -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <input 
          type="password" 
          id="password" 
          formControlName="password"
          placeholder="Enter your password"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          [ngClass]="loginForm.get('password')?.invalid && (loginForm.get('password')?.dirty || loginForm.get('password')?.touched)?'border-red-400 focus:ring-red-500':'focus:ring-green-400'"
        >
        <small 
          *ngIf="loginForm.get('password')?.invalid && (loginForm.get('password')?.dirty || loginForm.get('password')?.touched)"
          class="text-red-500 text-xs mt-1"
        >
          Password is required and must be at least 6 characters
        </small>
      </div>

      <!-- Login Button -->
      <button 
        type="submit" 
        [disabled]="loginForm.invalid"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#8B9F82] hover:bg-[#8B9F82]/95 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed outline-none"
      >
        Login
      </button>

      <!-- Forgotten Password and Register Links -->
      <div class="flex justify-between text-sm text-gray-600 mt-2">
        <a (click)="navigateToForgetPassword()" class="hover:text-green-600">Forgot Password?</a>
        <a (click)="navigateToRegister()" class="hover:text-green-600">Not registered yet?</a>
      </div>

      <!-- Social Login -->
      <div class="mt-4">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Or login with</span>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-3">
          <button 
            type="button" 
            (click)="loginWithGoogle()"
            class="w-full flex items-center justify-center bg-[#8B9F82] text-white py-2 rounded-md hover:bg-[#8B9F82]/95 transition duration-300"
          >
            Google
          </button>
          <button 
            type="button" 
            (click)="loginWithGitHub()"
            class="w-full flex items-center justify-center bg-[#8B9F82]/40 text-#8B9F82]/70 py-2 rounded-md transition duration-300"
          >
            GitHub
          </button>
        </div>
      </div>
    </form>
  </div>
</div>

  `,
  styles: [],
})
export class AuthenticationComponent {

  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate(['/home']);
      }
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login(username, password).subscribe({
        next: (success) => {
          if (success) {
            this.router.navigate(['/home']);
          } else {
            this.errorMessage = 'Login failed. Please try again.';
          }
        },
        error: (err) => {
          console.error('Login error:', err);
          this.errorMessage = 'An error occurred. Please try again later.';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  // Method for Google login
  loginWithGoogle() {
    console.log('Logging in with Google');
    // Logic for Google login
  }

  // Method for GitHub login
  loginWithGitHub() {
    console.log('Logging in with GitHub');
    // Logic for GitHub login
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  navigateToForgetPassword() {
    this.router.navigate(['/forget-password']);
  }
}
