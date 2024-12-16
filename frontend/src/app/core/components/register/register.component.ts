import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { ToastService } from '../../toast.service';

@Component({
  selector: 'ccnta-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private authService: AuthenticationService = inject(AuthenticationService);
  registrationForm: FormGroup;
  fileError: string | null = null;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.router.navigate(['/home']);
      }
    });

    this.registrationForm = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, this.passwordValidator]],
        confirmPassword: ['', [Validators.required]],
        profile: [null],
      },
      {
        validators: this.matchPasswords('password', 'confirmPassword'),
      }
    );
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fileError = null;
    this.previewUrl = null;

    if (input?.files?.length) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.fileError = 'Only image files are allowed.';
        input.value = '';
        this.registrationForm.get('profile')?.setValue(null);
        this.selectedFile = null;
        return;
      }

      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        this.fileError = 'File size must not exceed 5MB.';
        input.value = '';
        this.registrationForm.get('profile')?.setValue(null);
        this.selectedFile = null;
        return;
      }

      // Store the file and create preview
      this.selectedFile = file;
      this.registrationForm.patchValue({ profile: file });
      this.createImagePreview(file);
    }
  }

  private createImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  // Custom Validator for Password Strength
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const hasNumber = /\d/.test(control.value);
    const hasUpperCase = /[A-Z]/.test(control.value);
    const hasLowerCase = /[a-z]/.test(control.value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(control.value);
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

  navigateToAuthentication() {
    this.router.navigate(['/authentication']);
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      const formData = new FormData();
      const formValue = this.registrationForm.getRawValue();

      formData.append('firstName', formValue.firstName);
      formData.append('lastName', formValue.lastName);
      formData.append('email', formValue.email);
      formData.append('password', formValue.password);
      formData.append('confirmPassword', formValue.password);
      localStorage.setItem('email', formValue.email);

      // Only append profile if a file was selected
      if (this.selectedFile) {
        formData.append('profile', this.selectedFile, this.selectedFile.name);
      }

      this.authService.register(formData).subscribe({
        next: () => {
          localStorage.setItem('email', formValue.email);
          this.router.navigate(['/auth/validate-token']);
        },
        error: (error) => {
          this._toastService.show(error.error.message, 'DANGER', null);
          console.error('Registration failed', error);
        },
      });
    } else {
      this.registrationForm.markAllAsTouched();
    }
  }
}
