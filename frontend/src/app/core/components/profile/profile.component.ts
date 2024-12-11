import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Interface for User
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePicture: string;
  role: string;
  department: string;
  location: string;
  bio: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="">
      <div class="">
        <!-- Profile Header with Picture Upload -->
        <div class="relative bg-gradient-to-r from-[#8B9F82]/70 to-[#8B9F82] h-36 rounded-t-md">
          <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
            <div class="relative">
              <!-- Profile Picture -->
              <div class="relative w-40 h-40 rounded-full border-4 border-white">
                <img 
                  [src]="previewImage || user.profilePicture" 
                  alt="Profile Picture"
                  class="w-full h-full rounded-full object-cover"
                >
                
                <!-- Image Upload Overlay -->
                <label 
                  *ngIf="isEditing"
                  class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-300"
                >
                  <input 
                    type="file" 
                    class="hidden" 
                    accept="image/*"
                    (change)="onFileSelected($event)"
                  >
                  <span class="text-white text-sm">Change Photo</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Content -->
        <div class="pt-24 px-6 pb-6">
          <!-- Header with Edit/Save Controls -->
          <div class="flex justify-between items-start mb-6">
            <div>
              <h1 *ngIf="!isEditing" class="text-2xl font-bold text-gray-900">
                {{ user.firstName }} {{ user.lastName }}
              </h1>
              <p class="text-gray-600">{{ user.role }}</p>
            </div>

            <!-- Edit Controls -->
            <div>
              <button 
                *ngIf="!isEditing"
                (click)="startEditing()"
                class="px-4 py-2 bg-[#8B9F82] text-white rounded-md hover:bg-[#8B9F82]/95 transition-colors"
              >
                Edit Profile
              </button>

              <div *ngIf="isEditing" class="flex space-x-2">
                <button 
                  (click)="saveChanges()"
                  [disabled]="!editForm.valid"
                  class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Save
                </button>
                <button 
                  (click)="cancelEditing()"
                  class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <!-- View Mode -->
          <ng-container *ngIf="!isEditing">
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h2 class="text-lg font-semibold mb-4">Personal Information</h2>
                <div class="space-y-3">
                  <div>
                    <p class="text-sm text-gray-500">Email</p>
                    <p class="text-gray-900">{{ user.email }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Phone</p>
                    <p class="text-gray-900">{{ user.phone }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Location</p>
                    <p class="text-gray-900">{{ user.location }}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 class="text-lg font-semibold mb-4">Work Information</h2>
                <div class="space-y-3">
                  <div>
                    <p class="text-sm text-gray-500">Department</p>
                    <p class="text-gray-900">{{ user.department }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Role</p>
                    <p class="text-gray-900">{{ user.role }}</p>
                  </div>
                </div>
              </div>

              <div class="md:col-span-2">
                <h2 class="text-lg font-semibold mb-4">Bio</h2>
                <p class="text-gray-900">{{ user.bio }}</p>
              </div>
            </div>
          </ng-container>

          <!-- Edit Mode -->
          <form 
            *ngIf="isEditing" 
            [formGroup]="editForm" 
            class="grid md:grid-cols-2 gap-6"
          >
            <div>
              <h2 class="text-lg font-semibold mb-4">Personal Information</h2>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm text-gray-600 mb-1">First Name</label>
                  <input 
                    type="text" 
                    formControlName="firstName"
                    class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                </div>
                <div>
                  <label class="block text-sm text-gray-600 mb-1">Last Name</label>
                  <input 
                    type="text" 
                    formControlName="lastName"
                    class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                </div>
                <div>
                  <label class="block text-sm text-gray-600 mb-1">Email</label>
                  <input 
                    type="email" 
                    formControlName="email"
                    class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                </div>
                <div>
                  <label class="block text-sm text-gray-600 mb-1">Phone</label>
                  <input 
                    type="tel" 
                    formControlName="phone"
                    class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                </div>
                <div>
                  <label class="block text-sm text-gray-600 mb-1">Location</label>
                  <input 
                    type="text" 
                    formControlName="location"
                    class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                </div>
              </div>
            </div>

            <div>
              <h2 class="text-lg font-semibold mb-4">Work Information</h2>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm text-gray-600 mb-1">Department</label>
                  <input 
                    type="text" 
                    formControlName="department"
                    class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                </div>
                <div>
                  <label class="block text-sm text-gray-600 mb-1">Role</label>
                  <input 
                    type="text" 
                    formControlName="role"
                    class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                </div>
              </div>
            </div>

            <div class="md:col-span-2">
              <h2 class="text-lg font-semibold mb-4">Bio</h2>
              <textarea 
                formControlName="bio"
                rows="4"
                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProfileComponent implements OnInit {
  user: User = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 890',
    profilePicture: 'https://st4.depositphotos.com/12982378/41778/i/450/depositphotos_417780208-stock-photo-beautiful-woman-posing-isolated-grey.jpg',
    role: 'Senior Developer',
    department: 'Engineering',
    location: 'New York, USA',
    bio: 'Passionate about creating amazing web applications and solving complex problems.'
  };

  editForm: FormGroup;
  isEditing = false;
  previewImage: string | null = null;

  constructor(private fb: FormBuilder) {
    this.editForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      role: ['', Validators.required],
      department: ['', Validators.required],
      location: ['', Validators.required],
      bio: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.editForm.patchValue(this.user);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      const reader = new FileReader();
      
      reader.onload = () => {
        // Set preview image
        this.previewImage = reader.result as string;
        
        // Optional: If you want to send the file to backend, you can do it here
        // this.uploadProfilePicture(file);
      };
      
      reader.readAsDataURL(file);
    }
  }

  // Optional method for actual file upload
  // uploadProfilePicture(file: File): void {
  //   // Implement your file upload logic here
  //   // This would typically involve sending the file to a backend service
  // }

  startEditing(): void {
    this.isEditing = true;
    this.previewImage = null; // Reset preview when entering edit mode
    this.editForm.patchValue(this.user);
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.previewImage = null; // Reset preview when canceling
    this.editForm.patchValue(this.user);
  }

  saveChanges(): void {
    if (this.editForm.valid) {
      // Update user object
      this.user = { 
        ...this.user, 
        ...this.editForm.value,
        // Use preview image if available, otherwise keep existing profile picture
        profilePicture: this.previewImage || this.user.profilePicture 
      };

      // Optional: Here you would typically make an API call to save changes
      // this.userService.updateProfile(this.user);

      console.log(this.user)

      this.isEditing = false;
      this.previewImage = null;
    }
  }
}