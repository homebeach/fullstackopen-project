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
  borrowedItems: string[] = [];
  borrowedItemsUrl: string = 'http://localhost:3001/api/library/borrowed'; // API endpoint
  logoutUrl: string = 'http://localhost:3001/api/logout';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadBorrowedItems();
  }

  loadBorrowedItems(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, skipping borrowed items fetch');
      return;
    }

    this.http.get<any[]>(this.borrowedItemsUrl, {
      headers: { Authorization: `Bearer ${token}` },
    }).subscribe({
      next: (response) => {
        // Save fetched borrowed items to localStorage
        this.borrowedItems = response.map((item) => item.title); // Or map to desired properties
        localStorage.setItem('borrowedItems', JSON.stringify(this.borrowedItems));
      },
      error: (err) => {
        console.error('Error fetching borrowed items:', err);
        alert('Failed to load borrowed items.');
      },
    });
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
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout error:', err);
        alert('Logout failed. Please try again later.');
      },
    });
  }
}
