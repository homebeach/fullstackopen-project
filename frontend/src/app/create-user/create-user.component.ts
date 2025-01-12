import { Component, OnInit } from '@angular/core';
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
export class CreateUserComponent implements OnInit {
  userForm: FormGroup; // FormGroup to handle user input
  successMessage: string = '';
  errorMessage: string = '';
  availableUserTypes: string[] = []; // List of user types available based on logged-in role
  isAuthenticated: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    // Initialize the form
    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      user_type: ['Customer', [Validators.required]], // Default to Customer
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    const userRole = localStorage.getItem('userType'); // Get userType from localStorage
    this.isAuthenticated = !!userRole;

    if (!this.isAuthenticated) {
      // If not authenticated, user type is fixed to Customer
      this.userForm.get('user_type')?.setValue('Customer');
      this.userForm.get('user_type')?.disable();
    } else {
      // Set available user types based on role
      switch (userRole) {
        case 'Librarian':
          this.availableUserTypes = ['Customer', 'Librarian'];
          break;
        case 'Admin':
          this.availableUserTypes = ['Customer', 'Librarian', 'Admin'];
          break;
        default:
          this.availableUserTypes = ['Customer'];
          break;
      }
    }
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
        this.userForm.get('user_type')?.setValue('Customer'); // Reset user type to default
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
