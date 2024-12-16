import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'ccnta-validate-otp',
  templateUrl: './validate-otp.component.html',
  styles: [
    `
    :host {
        display: block;
      }

      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      input[type='number'] {
        -moz-appearance: textfield;
      }
    `
  ]
})
export class ValidateOtpComponent {

  private readonly otpLength = 6;
  private resendAttempts = signal(0);
  private isResendDisabled = signal(false);
  private _router: Router = inject(Router);
  private _authenticationService: AuthenticationService = inject(AuthenticationService);
  protected isLoading = false;

  otpForm = new FormGroup({});
  otpControlArray: FormControl[] = [];

  // Track form values using a signal
  private formValues = signal<string[]>(['', '', '', '', '', '']);

  // Computed property for form completion
  isComplete = computed(() => {
    const values = this.formValues();
    return values.every((value) => value !== '' && /^\d$/.test(value));
  });

  constructor() {

    this._authenticationService.isAuthenticated$
    .subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this._router.navigate(['/home']);
      }
    });

    // Initialize form controls
    for (let i = 0; i < this.otpLength; i++) {
      const control = new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d$/),
      ]);

      // Subscribe to value changes
      control.valueChanges.subscribe((value) => {
        const newValues = [...this.formValues()];
        newValues[i] = value;
        this.formValues.set(newValues);
      });

      this.otpControlArray.push(control);
      this.otpForm.addControl(`digit${i}`, control);
    }

    // Effect to automatically submit when OTP is complete
    effect(() => {
      if (this.isComplete()) {
        this.onSubmit();
      }
    });
  }


  // Method to check form completion in template
  isFormComplete(): boolean {
    return this.isComplete();
  }

  handleInput(index: number): void {
    const currentValue = this.otpControlArray[index].value;

    if (currentValue && index < this.otpLength - 1) {
      // Move to next input if value is valid
      const nextInput = document.querySelector(
        `input:nth-child(${index + 2})`
      ) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  handleKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      if (!this.otpControlArray[index].value && index > 0) {
        // Move to previous input on backspace if current input is empty
        const prevInput = document.querySelector(
          `input:nth-child(${index})`
        ) as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
          this.otpControlArray[index - 1].setValue('');
        }
      }
    }
  }

  handleFocus(index: number): void {
    // Select the content when focused
    const input = document.querySelector(
      `input:nth-child(${index + 1})`
    ) as HTMLInputElement;
    if (input) {
      input.select();
    }
  }

  handlePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text');
    const pastedDigits =
      pastedData?.match(/\d/g)?.slice(0, this.otpLength) || [];

    const newValues = [...this.formValues()];
    pastedDigits.forEach((digit, index) => {
      if (index < this.otpLength) {
        this.otpControlArray[index].setValue(digit);
        newValues[index] = digit;
      }
    });
    this.formValues.set(newValues);

    // Focus the next empty input or last input
    const nextEmptyIndex = newValues.findIndex((value) => !value);
    const focusIndex =
      nextEmptyIndex === -1 ? this.otpLength - 1 : nextEmptyIndex;
    const nextInput = document.querySelector(
      `input:nth-child(${focusIndex + 1})`
    ) as HTMLInputElement;
    if (nextInput) {
      nextInput.focus();
    }
  }

  getOtpValue(): string {
    return this.formValues().join('');
  }

  onSubmit(): void {
    if (this.isComplete()) {
      const otpValue = this.getOtpValue();
      console.log('Submitting OTP:', otpValue);
      
      this.isLoading = true;
      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
      
      this._authenticationService.validateOTP(otpValue)
        .subscribe({
          next: (response: boolean) => {
            if (response) {
              this._router.navigate(['/auth/login']);
            } else {
              // Handle invalid OTP (optional: show error message)
              console.error('Invalid OTP');
            }
          },
          error: (error) => console.error('Error validating OTP:', error)
        });
    }
  }

  resendCode(event: Event): void {
    event.preventDefault();
    if (this.isResendDisabled()) return;

    this.resendAttempts.update((count) => count + 1);
    this.isResendDisabled.set(true);

    const email = localStorage.getItem('email-for-otp') || '';

    // Call forget password request to resend OTP
    this._authenticationService.forgetPasswordRequest(email)
      .subscribe({
        next: () => {
          console.log('OTP Resent');
          // Optionally show success message
        },
        error: (error) => console.error('Error resending OTP:', error)
      });

    // Disable resend for 30 seconds
    setTimeout(() => {
      this.isResendDisabled.set(false);
    }, 30000);
  }
}