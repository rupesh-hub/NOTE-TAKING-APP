import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'nta-authentication',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss',
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
}
