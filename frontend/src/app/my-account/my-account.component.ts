import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Import CommonModule for ngIf
import { UserService, User } from '../services/user.service';  // Import UserService and User model
import { Router } from '@angular/router';  // To navigate after successful update
import { FormsModule } from '@angular/forms'; // For ngModel binding

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [FormsModule, CommonModule],  // Import FormsModule for two-way binding
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit {
  user: User = {
    id: 0,
    username: '',
    firstname: '',
    lastname: '',
    user_type: '',
    created_at: '',
    disabled: false,
    password: ''
  };
  newPassword: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    // Fetch logged-in user's data
    const userId = localStorage.getItem('userId');  // Assume userId is stored in localStorage after login
    if (userId) {
      this.userService.getUserById(+userId).subscribe(
        (data) => {
          this.user = data;
        },
        (error) => {
          this.errorMessage = 'Failed to fetch user data';
        }
      );
    }
  }

  onSubmit(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long.';
      return;
    }

    const updatedData: Partial<User> = {
      username: this.user.username,
      firstname: this.user.firstname,
      lastname: this.user.lastname
    };

    // Include password if it's being changed
    if (this.newPassword) {
      updatedData.password = this.newPassword;
    }

    this.userService.updateUser(this.user.id, updatedData).subscribe(
      (response) => {
        this.successMessage = 'User data updated successfully';
      },
      (error) => {
        this.errorMessage = 'Failed to update user data';
      }
    );
  }

}
