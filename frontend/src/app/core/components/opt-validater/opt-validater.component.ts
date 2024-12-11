
import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'nta-opt-validater',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

        <h2 class="mt-6 text-center text-2xl font-extrabold text-gray-600">
          Validate your one time password
        </h2>
      </div>

      <div
        class="max-w-md mx-auto text-center bg-white px-4 sm:px-8 py-10 rounded-xl shadow"
      >
        <header class="mb-8">
          <p class="text-[15px] text-slate-500">
            Enter the 4-digit verification code that was sent to your email.
          </p>
        </header>

        <form [formGroup]="otpForm" (ngSubmit)="onSubmit()">
          <div class="flex items-center justify-center gap-3">
            @for (control of otpControlArray; track $index) {
            <input
              #otpInput
              type="text"
              [formControl]="control"
              (input)="handleInput($index)"
              (keydown)="handleKeyDown($event, $index)"
              (focus)="handleFocus($index)"
              (paste)="handlePaste($event)"
              class="w-14 h-14 text-center text-lg font-medium text-[#8B9F82] bg-[#8B9F82]/10 border border-transparent hover:border-[#8B9F82]/30 appearance-none rounded p-4 outline-none focus:bg-white focus:border-[#8B9F82]/40 focus:ring-2 focus:ring-[#8B9F82]/10"
              pattern="d*"
              maxlength="1"
            />
            }
          </div>

          <div class="max-w-[260px] mx-auto mt-4">
            <button
              type="submit"
              [disabled]="!isComplete()"
              class="w-full inline-flex justify-center whitespace-nowrap rounded-lg bg-[#8B9F82] px-3.5 py-2.5 text-sm font-medium text-white shadow-sm shadow-purple-950/10 hover:bg-[#8B9F82]/95 focus:outline-none focus:ring focus:ring-[#8B9F82]/30 focus-visible:outline-none focus-visible:ring focus-visible:ring-[#8B9F82]/30 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify Account
            </button>
          </div>
        </form>

        <div class="text-sm text-slate-500 mt-4">
          Didn't receive code?
          <a
            class="font-medium text-[#8B9F82] hover:text-[#8B9F82]/95 ml-1"
            href="#"
            (click)="resendCode($event)"
          >
            Resend
          </a>
        </div>
      </div>
    </div>
  `,
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
export class OptValidaterComponent {


  private readonly otpLength = 4;
  private resendAttempts = signal(0);
  private isResendDisabled = signal(false);
  private _router:Router = inject(Router);

  otpForm = new FormGroup({});
  otpControlArray: FormControl[] = [];

  // Track form values using a signal
  private formValues = signal<string[]>(['', '', '', '']);

  // Computed property for form completion
  isComplete = computed(() => {
    const values = this.formValues();
    return values.every((value) => value !== '' && /^\d$/.test(value));
  });

  constructor() {
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

    // Effect to watch for form completion
    effect(() => {
      if (this.isComplete()) {
        console.log('OTP Completed:', this.getOtpValue());
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

      this._router.navigate(['/reset-password']);
    }
  }

  resendCode(event: Event): void {
    event.preventDefault();
    if (this.isResendDisabled()) return;

    this.resendAttempts.update((count) => count + 1);
    this.isResendDisabled.set(true);

    // Implement resend logic here
    console.log('Resending code...');

    // Disable resend for 30 seconds
    setTimeout(() => {
      this.isResendDisabled.set(false);
    }, 30000);



  }

}
