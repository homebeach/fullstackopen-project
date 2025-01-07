import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for Angular directives
import { HttpClient } from '@angular/common/http'; // Import HttpClient for API requests
import { LibraryService } from '../library.service';

@Component({
  selector: 'app-library-list',
  standalone: true, // Mark as a standalone component
  imports: [CommonModule], // Import CommonModule for *ngFor, *ngIf, etc.
  templateUrl: './library-list.component.html',
  styleUrls: ['./library-list.component.css'],
})
export class LibraryListComponent implements OnInit {
  libraryItems: any[] = [];
  errorMessage: string = '';
  borrowedItems: string[] = []; // Array to store borrowed item IDs

  constructor(
    private libraryService: LibraryService,
    private http: HttpClient // Inject HttpClient
  ) {}

  ngOnInit(): void {
    this.libraryService.getLibraryItems().subscribe(
      (items) => {
        this.libraryItems = items;
        this.loadBorrowedItems();
      },
      (error) => (this.errorMessage = 'Failed to fetch library items')
    );
  }

    loadBorrowedItems(): void {
    // Retrieve borrowed items from localStorage
    const borrowedItemsJson = localStorage.getItem('borrowedItems');
    if (borrowedItemsJson) {
      try {
        this.borrowedItems = JSON.parse(borrowedItemsJson);
      } catch (error) {
        console.error('Error parsing borrowed items from localStorage:', error);
        this.borrowedItems = [];
      }
    }
  }

  borrowItem(itemId: number): void {
    const url = `http://localhost:3001/api/borrowItem/${itemId}/borrow`;

    // Retrieve the token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found. User is not authenticated.');
      this.errorMessage = 'Please log in to borrow items.';
      return;
    }

    // Set headers with the token
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    this.http.post(url, {}, { headers }).subscribe({
      next: () => {
        console.log(`Item with ID ${itemId} borrowed successfully`);

        // Update the item's availability in the UI
        const borrowedItem = this.libraryItems.find((item) => item.id === itemId);
        if (borrowedItem) {
          borrowedItem.copiesAvailable = Math.max(borrowedItem.copiesAvailable - 1, 0);
        }
      },
      error: (error) => {
        console.error('Failed to borrow item:', error);

        // Display appropriate error message
        if (error.status === 401) {
          this.errorMessage = 'Unauthorized. Please log in again.';
        } else {
          this.errorMessage = 'Could not borrow the item. Please try again.';
        }
      },
    });
  }

    isItemBorrowed(itemId: string): boolean {
    // Check if the item ID is already in the borrowedItems array
      return this.borrowedItems.includes(itemId);
    }

}
