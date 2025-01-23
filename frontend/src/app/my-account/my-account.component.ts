import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PasswordChangeModalComponent } from '../password-change-modal/password-change-modal.component';


@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [FormsModule, CommonModule, PasswordChangeModalComponent],
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css'],
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
    password: '',
  };
  errorMessage: string = '';
  successMessage: string = '';
  isPasswordModalOpen: boolean = false;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId'); // Assume userId is stored after login
    if (userId) {
      this.userService.getUserById(+userId).subscribe(
        (data) => {
          this.user = data; // Prefill the form with user data
        },
        () => {
          this.errorMessage = 'Failed to fetch user data.';
        }
      );
    }
  }

  onSubmit(): void {
    const updatedData: Partial<User> = {
      username: this.user.username,
      firstname: this.user.firstname,
      lastname: this.user.lastname,
    };

    this.userService.updateUser(this.user.id, updatedData).subscribe(
      () => {
        this.successMessage = 'User data updated successfully.';
        this.errorMessage = '';
      },
      () => {
        this.errorMessage = 'Failed to update user data.';
      }
    );
  }

  openPasswordChangeModal(): void {
    this.isPasswordModalOpen = true;
  }

  closePasswordChangeModal(): void {
    this.isPasswordModalOpen = false;
  }

  changePassword({ newPassword }: { newPassword: string }): void {
    if (this.user.id) {
      this.userService.updateUser(this.user.id, { password: newPassword }).subscribe(
        (response) => {
          this.successMessage = response.message; // Use the message from the response
          this.errorMessage = '';
          this.closePasswordChangeModal();
        },
        () => {
          this.errorMessage = 'Failed to update password.';
        }
      );
    }
  }

}
