import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'ccnta-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  private _router: Router = inject(Router);
  private _authenticationService: AuthenticationService = inject(
    AuthenticationService
  );
  private fb: FormBuilder = inject(FormBuilder);
  private _activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  faEyeSlash = faEyeSlash;
  faEye = faEye;

  resetPasswordForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showPasswordConfirm = false;
  private _validationToken: string;

  constructor() {
    this._validationToken = this._activatedRoute.snapshot.paramMap.get('token');

    this._authenticationService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        if (isAuthenticated) {
          this._router.navigate(['/home']);
        }
      }
    );

    this.resetPasswordForm = this.fb.group(
      {
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            this.passwordValidator,
          ],
        ],
        confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
      },
      {
        validators: this.matchPasswords('password', 'confirmPassword'),
      }
    );
  }

  // Custom Validator for Password Strength
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const hasNumber = /\d/.test(value);
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const valid = hasNumber && hasUpperCase && hasLowerCase && hasSpecialChar;
    return !valid ? { weakPassword: true } : null;
  }

  // Custom Validator for Confirm Password Match
  matchPasswords(password: string, confirmPassword: string) {
    return (formGroup: AbstractControl) => {
      const passwordControl = formGroup.get(password);
      const confirmPasswordControl = formGroup.get(confirmPassword);

      if (
        confirmPasswordControl?.errors &&
        !confirmPasswordControl.errors['passwordMismatch']
      ) {
        return;
      }

      if (passwordControl?.value !== confirmPasswordControl?.value) {
        confirmPasswordControl?.setErrors({ passwordMismatch: true });
      } else {
        confirmPasswordControl?.setErrors(null);
      }
    };
  }

  onSubmits() {
    if (this.resetPasswordForm.valid) {
      this.isLoading = true;
      const email = localStorage.getItem('email-for-reset') || '';
      const { password, confirmPassword } = this.resetPasswordForm.value;

      this._authenticationService
        .resetPassword(password, confirmPassword, this._validationToken)
        .subscribe({
          next: (response: boolean) => {
            this.isLoading = false;
            if (response) {
              this._router.navigate(['/auth/login']);
            }
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Password reset failed', err);
          },
        });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showPasswordConfirm = !this.showPasswordConfirm;
  }
}
