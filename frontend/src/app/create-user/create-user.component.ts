import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-create-user',
  standalone: true, // Standalone component
  imports: [CommonModule, ReactiveFormsModule], // Import ReactiveFormsModule here
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css'],
})
export class CreateUserComponent {
  userForm: FormGroup; // FormGroup to handle user input
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
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
    const apiUrl = `${environment.apiBaseUrl}/api/users`; // API endpoint

    this.http.post(apiUrl, userData).subscribe({
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
