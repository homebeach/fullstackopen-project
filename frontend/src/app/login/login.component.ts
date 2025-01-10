import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'; // Import the environment file

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  baseUrl: string = environment.apiBaseUrl; // Use the base URL from environment

  constructor(private http: HttpClient, private router: Router) {
    // Debugging router events
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

    const url = `${this.baseUrl}/api/login`; // Use baseUrl from environment

    console.log('Login request payload:', loginData); // Debug payload

    this.http.post(url, loginData).subscribe({
      next: (response: any) => {
        console.log('Server response:', response); // Debug server response

        // Destructure response
        const { token, username, firstname, lastname, borrowedItems } = response;

        if (!token) {
          console.error('Token not found in response. Cannot authenticate.');
          this.errorMessage = 'Authentication failed. Please try again.';
          return;
        }

        console.log('Token:', token);
        console.log('Firstname:', firstname);
        console.log('Lastname:', lastname);
        console.log('Borrowed Items:', borrowedItems);

        // Store token, user details, and borrowed items in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('firstname', firstname);
        localStorage.setItem('lastname', lastname);
        localStorage.setItem('borrowedItems', JSON.stringify(borrowedItems || []));

        // Navigate to the library list
        this.router.navigate(['/library-list']).then((success) => {
          if (success) {
            console.log('Navigation to /library-list successful');
          } else {
            console.error('Navigation to /library-list failed');
          }
        });
      },
      error: (error) => {
        console.error('Login error:', error); // Debug error response
        this.errorMessage = 'Invalid username or password'; // Set error message
      },
    });
  }
}
