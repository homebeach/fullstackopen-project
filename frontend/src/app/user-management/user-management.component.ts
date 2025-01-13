import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PasswordChangeModalComponent } from '../password-change-modal/password-change-modal.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PasswordChangeModalComponent],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  errorMessage: string = '';
  userRole: string = ''; // Logged-in user's role
  isPasswordModalOpen: boolean = false; // Flag to show the password change modal
  currentUserForPasswordChange: User | null = null; // Store the user currently selected for password change

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // Fetch users when the component loads
    this.userService.getUsers().subscribe(
      (items) => {
        this.users = items;
      },
      (error) => {
        this.errorMessage = 'Failed to fetch users';
      }
    );

    // Example: Set the userRole based on token or a service
    this.userRole = localStorage.getItem('userType') || 'Customer';
  }

  /**
   * Open the password change modal for a specific user.
   */
  openPasswordChangeModal(user: User) {
    this.isPasswordModalOpen = true;
    this.currentUserForPasswordChange = user;
  }

  /**
   * Close the password change modal.
   */
  closePasswordChangeModal() {
    this.isPasswordModalOpen = false;
    this.currentUserForPasswordChange = null;
  }

  /**
   * Save the new password for the user.
   */
  changePassword({ newPassword }: { newPassword: string }) {
    if (this.currentUserForPasswordChange) {
      this.userService.updateUser(this.currentUserForPasswordChange.id, { password: newPassword }).subscribe(
        (response) => {
          alert('Password updated successfully!');
          this.closePasswordChangeModal(); // Close modal after successful password update
        },
        (error) => {
          this.errorMessage = 'Failed to update password';
        }
      );
    }
  }

  /**
   * Check if the current user can edit the given user's details.
   */
  canEdit(user: User): boolean {
    if (this.userRole === 'Admin') {
      return true; // Admins can edit any user
    }
    if (this.userRole === 'Librarian' && user.user_type === 'Customer') {
      return true; // Librarians can edit Customers
    }
    return false; // No permissions otherwise
  }
}
