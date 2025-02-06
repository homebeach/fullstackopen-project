import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LogoutService } from '../services/logout.service'; // Import the service
import { CommonModule } from '@angular/common'; // Import CommonModule
import { RouterModule } from '@angular/router'; // Import RouterModule

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css'],
})
export class MenuBarComponent {
  firstname: string = localStorage.getItem('firstname') || '';
  lastname: string = localStorage.getItem('lastname') || '';
  token: string = localStorage.getItem('token') || '';
  userType: string = localStorage.getItem('userType') || '';

  constructor(private router: Router, private logoutService: LogoutService) {}

  logout(): void {
    // Clear all user-related data from localStorage before logging out
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('firstname');
    localStorage.removeItem('lastname');
    localStorage.removeItem('userType');
    localStorage.removeItem('borrowedItems');

    // Attempt to call logout API but navigate regardless of the outcome
    this.logoutService.logout().subscribe({
      next: () => {
        console.log('Logged out successfully');
      },
      error: (err) => {
        console.error('Logout failed:', err);
      },
      complete: () => {
        this.router.navigate(['/login']).then((success) => {
          if (success) {
            console.log('Navigated to login page');
          } else {
            console.error('Failed to navigate to login page');
          }
        });
      }
    });

    // Ensure navigation happens even if subscribe() doesn't trigger
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 500); // Small delay to let API attempt execution
  }

  isLibrarianOrAdmin(): boolean {
    return this.userType === 'Librarian' || this.userType === 'Admin';
  }
}
