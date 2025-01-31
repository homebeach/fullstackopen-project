import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LogoutService } from '../services/logout.service'; // Import the service
import { CommonModule } from '@angular/common'; // Import CommonModule
import { RouterModule } from '@angular/router'; // Import RouterModule

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [CommonModule, RouterModule], // Import necessary Angular modules
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css'],
})
export class MenuBarComponent {
  firstname: string = localStorage.getItem('firstname') || '';
  lastname: string = localStorage.getItem('lastname') || '';
  token: string = localStorage.getItem('token') || '';
  userType: string = localStorage.getItem('userType') || ''; // Retrieve userType from localStorage

  constructor(private router: Router, private logoutService: LogoutService) {}

  logout(): void {
    this.logoutService.logout().subscribe({
      next: () => {
        console.log('Logged out successfully');
        this.router.navigate(['/login']).then((success) => {
          if (success) {
            console.log('Navigated to login page');
          } else {
            console.error('Failed to navigate to login page');
          }
        });
      },
      error: (err) => {
        console.error('Logout failed:', err);
      },
    });
  }

  isLibrarianOrAdmin(): boolean {
    return this.userType === 'Librarian' || this.userType === 'Admin';
  }
}
