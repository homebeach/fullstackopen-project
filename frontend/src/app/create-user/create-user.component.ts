import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../services/user.service';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css'],
})
export class CreateUserComponent implements OnInit {
  userForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  availableUserTypes: string[] = [];
  isAuthenticated: boolean = false;

  constructor(private fb: FormBuilder, private userService: UserService) {
    const userRole = localStorage.getItem('userType');
    this.isAuthenticated = !!userRole;

    this.userForm = this.fb.group(
      {
        username: ['', [Validators.required]],
        firstname: ['', [Validators.required]],
        lastname: ['', [Validators.required]],
        user_type: [{ value: 'Customer', disabled: !this.isAuthenticated }, [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    const userRole = localStorage.getItem('userType');

    if (this.isAuthenticated) {
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

  /**
   * Custom validator to check if password and confirmPassword match
   */
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password && confirmPassword && password !== confirmPassword
      ? { passwordMismatch: true }
      : null;
  };

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.errorMessage = 'Please fill out all required fields.';
      return;
    }

    const { confirmPassword, ...userData } = this.userForm.value; // Exclude confirmPassword

    this.userService.addUser(userData).subscribe({
      next: (response) => {
        this.successMessage = 'User created successfully!';
        this.errorMessage = '';
        this.userForm.reset();
        this.userForm.get('user_type')?.setValue('Customer');
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'Failed to create user.';
        this.successMessage = '';
      },
    });
  }
}
