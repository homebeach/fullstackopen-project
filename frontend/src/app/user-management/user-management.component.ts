import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Import RouterModule

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, RouterModule], // Add RouterModule here
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  errorMessage: string = '';
  userRole: string = ''; // Logged-in user's role

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
   * Check if the current user can delete the given user.
   */
  canDelete(user: User): boolean {
    if (this.userRole === 'Admin') {
      return true; // Admins can delete any user
    }
    if (this.userRole === 'Librarian' && user.user_type === 'Customer') {
      return true; // Librarians can delete Customers only
    }
    return false; // No permissions otherwise
  }

  /**
   * Show confirmation popup before deleting a user.
   * @param userId - The ID of the user to delete.
   */
  confirmDelete(userId: number): void {
    const isConfirmed = window.confirm(
      'Are you sure you want to delete this user? This action cannot be undone.'
    );

    if (isConfirmed) {
      this.deleteUser(userId);
    }
  }

  /**
   * Delete a user by ID.
   * @param userId - The ID of the user to delete.
   */
  deleteUser(userId: number): void {
    this.userService.deleteUser(userId).subscribe(
      () => {
        // Remove the deleted user from the list
        this.users = this.users.filter((user) => user.id !== userId);
      },
      (error) => {
        this.errorMessage = 'Failed to delete user';
      }
    );
  }
}
