import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router'; // Import RouterModule
import { CommonModule } from '@angular/common'; // Import CommonModule for structural directives
import { environment } from '../../environments/environment'; // Import the environment file

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [CommonModule, RouterModule], // Add RouterModule and CommonModule
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css'],
})
export class MenuBarComponent {
  firstname: string = localStorage.getItem('firstname') || '';
  lastname: string = localStorage.getItem('lastname') || '';
  token: string = localStorage.getItem('token') || '';
  userType: string = localStorage.getItem('userType') || ''; // Add userType from localStorage
  borrowedItems: string[] = JSON.parse(localStorage.getItem('borrowedItems') || '[]'); // Parse borrowed items from localStorage
  baseUrl: string = environment.apiBaseUrl; // Use the base URL from environment

  constructor(private router: Router, private http: HttpClient) {}

  logout(): void {
    if (!this.token) {
      console.error('No token found. Cannot logout.');
      return;
    }

    const logoutUrl = `${this.baseUrl}/api/logout`; // Use baseUrl from environment

    localStorage.clear();

    this.http.delete(logoutUrl, {
      headers: { Authorization: `Bearer ${this.token}` },
    }).subscribe({
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
        console.error('Logout error:', err);
      },
    });
  }

  isLibrarianOrAdmin(): boolean {
    return this.userType === 'Librarian' || this.userType === 'Admin';
  }
}
