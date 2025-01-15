import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Import CommonModule for Angular pipes like date
import { environment } from '../../environments/environment'; // Import the environment file
import { LibraryItem } from '../models/library-item.model'; // Import the LibraryItem model

@Component({
  selector: 'app-my-borrowed-items',
  standalone: true,
  imports: [CommonModule], // Include CommonModule to enable date pipe
  templateUrl: './my-borrowed-items.component.html',
  styleUrls: ['./my-borrowed-items.component.css'],
})
export class MyBorrowedItemsComponent implements OnInit {
  borrowedItems: LibraryItem[] = []; // Use LibraryItem model
  errorMessage: string = '';
  baseUrl: string = environment.apiBaseUrl; // Use the base URL from environment

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchBorrowedItems();
  }

  fetchBorrowedItems(): void {
    const token = localStorage.getItem('token');

    if (!token) {
      this.errorMessage = 'You must be logged in to view borrowed items.';
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const url = `${this.baseUrl}/api/library/borrowed`; // Use baseUrl from environment

    this.http.get<LibraryItem[]>(url, { headers }).subscribe({
      next: (data: LibraryItem[]) => {
        this.borrowedItems = data;

        // Extract item IDs and store in localStorage
        const borrowedItemIds = data.map((item) => item.id);
        localStorage.setItem('borrowedItems', JSON.stringify(borrowedItemIds));
      },
      error: (error) => {
        this.errorMessage = error.error || 'Failed to fetch borrowed items.';
      },
    });
  }

  returnItem(itemId: number | undefined): void {
    const url = `${this.baseUrl}/api/borrowItem/${itemId}/return`; // Use baseUrl from environment

    // Retrieve the token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found. User is not authenticated.');
      this.errorMessage = 'Please log in to return items.';
      return;
    }

    // Set headers with the token
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    this.http.post(url, {}, { headers }).subscribe({
      next: () => {
        console.log(`Item with ID ${itemId} returned successfully`);
        this.fetchBorrowedItems();
      },
      error: (error) => {
        console.error('Failed to return item:', error);

        // Display appropriate error message
        if (error.status === 401) {
          this.errorMessage = 'Unauthorized. Please log in again.';
        } else {
          this.errorMessage = 'Could not return the item. Please try again.';
        }
      },
    });
  }
}
