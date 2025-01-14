import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-create-library-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-library-item.component.html',
  styleUrls: ['./create-library-item.component.css'],
})
export class CreateLibraryItemComponent {
  libraryItem = {
    title: '',
    author: '',
    publishedDate: '',
    genre: '',
    type: '',
    copiesAvailable: 1,
  };
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient) {}

  onSubmit(): void {
    const url = `${environment.apiBaseUrl}/api/library-items`;
    const token = localStorage.getItem('token');

    if (!token) {
      this.errorMessage = 'You must be logged in to create a library item.';
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    this.http.post(url, this.libraryItem, { headers }).subscribe({
      next: () => {
        this.successMessage = 'Library item created successfully!';
        this.errorMessage = '';
        this.libraryItem = {
          title: '',
          author: '',
          publishedDate: '',
          genre: '',
          type: '',
          copiesAvailable: 1,
        };
      },
      error: (error) => {
        console.error('Failed to create library item:', error);
        this.errorMessage = 'An error occurred. Please try again.';
        this.successMessage = '';
      },
    });
  }
}
