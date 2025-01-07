import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css'],
  imports: [CommonModule],
})
export class MenuBarComponent {
  firstname: string = localStorage.getItem('firstname') || '';
  lastname: string = localStorage.getItem('lastname') || '';
  token: string = localStorage.getItem('token') || ''; // Add token property
  logoutUrl: string = 'http://localhost:3001/api/logout';
  borrowedItems: string[] = [];

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const borrowedItemsJson = localStorage.getItem('borrowedItems');
    if (borrowedItemsJson) {
      try {
        const parsedItems = JSON.parse(borrowedItemsJson);
        if (Array.isArray(parsedItems)) {
          this.borrowedItems = parsedItems;
        } else {
          console.warn('Borrowed items data is not an array. Defaulting to empty array.');
          this.borrowedItems = [];
        }
      } catch (error) {
        console.error('Error parsing borrowed items from localStorage:', error);
        this.borrowedItems = [];
      }
    }
  }

  logout(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found. Redirecting to login page.');
      localStorage.clear();
      this.router.navigate(['/login']);
      return;
    }

    localStorage.clear();

    this.http.delete(this.logoutUrl, {
      headers: { Authorization: `Bearer ${token}` },
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
        alert('Logout failed. Please try again later.');
      },
    });
  }
}
