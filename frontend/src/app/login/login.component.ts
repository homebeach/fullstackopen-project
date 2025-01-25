import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'; // Import the environment file

// Define a type for the API response
interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  firstname: string;
  lastname: string;
  userType: string;
  borrowedItems: any[];
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // Import RouterModule here
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  baseUrl: string = environment.apiBaseUrl; // Use the base URL from environment

  constructor(private http: HttpClient, private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        console.log('Navigation started to:', event.url);
      }
      if (event instanceof NavigationEnd) {
        console.log('Navigation ended at:', event.url);
      }
      if (event instanceof NavigationError) {
        console.error('Navigation error:', event.error);
      }
    });
  }

  onSubmit(): void {
    const loginData = {
      username: this.username,
      password: this.password,
    };

    const url = `${this.baseUrl}/api/login`;

    this.http.post<LoginResponse>(url, loginData).subscribe({
      next: (response) => {
        const { token, userId, username, firstname, lastname, userType, borrowedItems } = response;

        if (!token) {
          this.errorMessage = 'Authentication failed. Please try again.';
          return;
        }

        // Store data in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId.toString());
        localStorage.setItem('username', username);
        localStorage.setItem('firstname', firstname);
        localStorage.setItem('lastname', lastname);
        localStorage.setItem('userType', userType);
        localStorage.setItem('borrowedItems', JSON.stringify(borrowedItems || []));

        // Navigate to the library list
        this.router.navigate(['/library-list']).then((success) => {
          if (!success) {
            console.error('Navigation to /library-list failed');
          }
        });
      },
      error: (error) => {
        this.errorMessage = 'Invalid username or password';
        console.error('Login error:', error);
      },
    });
  }
}
