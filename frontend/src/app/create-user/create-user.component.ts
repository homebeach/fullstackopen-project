import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service'; // Import UserService

@Component({
  selector: 'app-create-user',
  standalone: true, // Standalone component
  imports: [CommonModule, ReactiveFormsModule], // Import ReactiveFormsModule
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css'],
})
export class CreateUserComponent {
  userForm: FormGroup; // FormGroup to handle user input
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private userService: UserService) {
    // Initialize the form
    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      user_type: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.errorMessage = 'Please fill out all required fields.';
      return;
    }

    const userData = this.userForm.value; // Get form data

    // Use UserService to create a new user
    this.userService.addUser(userData).subscribe({
      next: (response) => {
        this.successMessage = 'User created successfully!';
        this.errorMessage = '';
        this.userForm.reset(); // Reset the form
        console.log('User creation response:', response);
      },
      error: (error) => {
        console.error('User creation error:', error);
        this.errorMessage = error.error.message || 'Failed to create user.';
        this.successMessage = '';
      },
    });
  }
}
