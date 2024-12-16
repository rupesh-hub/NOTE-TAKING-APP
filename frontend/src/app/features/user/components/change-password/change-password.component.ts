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
import { UserService } from '../../user.service';

@Component({
  selector: 'ccnta-change-password',
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
  private _router: Router = inject(Router);
  private _activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private _userService: UserService = inject(UserService);
  private fb: FormBuilder = inject(FormBuilder);

  faEyeSlash = faEyeSlash;
  faEye = faEye;

  changePasswordForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showPasswordConfirm = false;
  showOldPassword = false;
  private tokenToValidate: any;

  constructor() {
    this.tokenToValidate = this._activatedRoute.snapshot.paramMap.get('token');

    this.changePasswordForm = this.fb.group(
      {
        oldPassword: ['', Validators.required],
        newPassword: [
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
        validators: this.matchPasswords('newPassword', 'confirmPassword'),
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
  matchPasswords(newPassword: string, confirmPassword: string) {
    return (formGroup: AbstractControl) => {
      const passwordControl = formGroup.get(newPassword);
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
    if (this.changePasswordForm.valid) {
      this.isLoading = true;
      const { oldPassword, newPassword, confirmPassword } = this.changePasswordForm.value;

      this._userService
        .changePassword(
          oldPassword,
          newPassword,
          confirmPassword,
          this.tokenToValidate
        )
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

  protected toggleOldPasswordVisibility = () => {
    this.showOldPassword = !this.showOldPassword;
  };
}
