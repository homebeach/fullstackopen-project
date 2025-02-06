import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
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
    this.userService.getUsers().subscribe({
      next: (items) => {
        this.users = items;
      },
      error: (error) => {
        this.errorMessage = 'Failed to fetch users';
      },
      complete: () => {
        // Optional: Perform any actions when the observable completes
      },
    });

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
      this.userService.updateUser(this.currentUserForPasswordChange.id, { password: newPassword }).subscribe({
        next: (response) => {
          alert('Password updated successfully!');
          this.closePasswordChangeModal(); // Close modal after successful password update
        },
        error: (error) => {
          this.errorMessage = 'Failed to update password';
        },
      });
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

  deleteUser(userId: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter(user => user.id !== userId);
          alert('User deleted successfully!');
        },
        error: () => {
          this.errorMessage = 'Failed to delete user';
        },
      });
    }
  }
}
