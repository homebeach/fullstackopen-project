import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(): void {
    const loginData = {
      username: this.username,
      password: this.password,
    };

    //const url = 'https://fullstackopen-project-arik.onrender.com/api/login';
    const url = 'http://localhost:3001/api/login';


    this.http.post(url, loginData).subscribe({
      next: (response: any) => {
        const { token, username, firstname, lastname } = response;

        console.log(token);
        console.log(firstname);
        console.log(lastname);

        // Store token in localStorage
        localStorage.setItem('token', token);

        // Optionally store user details
        localStorage.setItem('username', username);
        localStorage.setItem('firstname', firstname);
        localStorage.setItem('lastname', lastname);

        // Navigate to the library list
        this.router.navigate(['/library-list']);
      },
      error: () => {
        this.errorMessage = 'Invalid username or password';
      },
    });
  }
}
