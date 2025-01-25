import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for Angular directives
import { RouterModule } from '@angular/router'; // Import RouterModule for routerLink
import { HttpClient } from '@angular/common/http'; // Import HttpClient for API requests
import { LibraryService } from '../services/library.service';
import { LibraryItem } from '../models/library-item.model';
import { environment } from '../../environments/environment'; // Import the environment file
import { Subject } from 'rxjs'; // Import Subject for handling observables
import { takeUntil } from 'rxjs/operators'; // Import takeUntil to handle observable cleanup

@Component({
  selector: 'app-library-list',
  standalone: true, // Mark as a standalone component
  imports: [CommonModule, RouterModule], // Include RouterModule here
  templateUrl: './library-list.component.html',
  styleUrls: ['./library-list.component.css'],
})
export class LibraryListComponent implements OnInit, OnDestroy {
  libraryItems: LibraryItem[] = [];
  errorMessage: string = '';
  borrowedItems: string[] = []; // Array to store borrowed item IDs
  baseUrl: string = environment.apiBaseUrl; // Use the base URL from environment
  private destroy$ = new Subject<void>(); // Subject to handle component destruction

  constructor(
    private libraryService: LibraryService,
    private http: HttpClient // Inject HttpClient
  ) {}

  ngOnInit(): void {
    // Fetch library items and load borrowed items
    this.libraryService.getLibraryItems().pipe(
      takeUntil(this.destroy$) // Automatically unsubscribe on component destroy
    ).subscribe(
      (items) => {
        this.libraryItems = items;
        this.loadBorrowedItems();
      },
      (error) => (this.errorMessage = 'Failed to fetch library items')
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next(); // Emit value to complete the observable stream
    this.destroy$.complete(); // Complete the subject to clean up
  }

  loadBorrowedItems(): void {
    // Retrieve borrowed items from localStorage
    const borrowedItemsJson = localStorage.getItem('borrowedItems');
    if (borrowedItemsJson) {
      try {
        // Parse the stored JSON and convert each item to a string
        this.borrowedItems = JSON.parse(borrowedItemsJson).map((item: { toString: () => any; }) => item.toString());
      } catch (error) {
        console.error('Error parsing borrowed items from localStorage:', error);
        this.borrowedItems = [];
      }
    } else {
      this.borrowedItems = [];
    }
  }

  borrowItem(itemId: number): void {
    const url = `${this.baseUrl}/api/borrowItem/${itemId}/borrow`; // Use baseUrl from environment

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

    this.http.post(url, {}, { headers }).pipe(
      takeUntil(this.destroy$) // Automatically unsubscribe on component destroy
    ).subscribe({
      next: () => {
        console.log(`Item with ID ${itemId} borrowed successfully`);

        // Update the item's availability in the UI
        const borrowedItem = this.libraryItems.find((item) => item.id === itemId);
        if (borrowedItem) {
          borrowedItem.copiesAvailable -= 1; // Decrease the available copies count
        }

        // Add the borrowed item ID to the borrowedItems array
        this.borrowedItems.push(itemId.toString());

        // Update localStorage
        localStorage.setItem('borrowedItems', JSON.stringify(this.borrowedItems));

        console.log(`Updated borrowedItems: ${this.borrowedItems}`);
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

  isItemBorrowed(itemId: number): boolean {
    // Ensure both itemId and borrowedItems elements are strings for comparison
    const borrowedItemsAsStrings = this.borrowedItems.map((id) => id.toString());
    const isBorrowed = borrowedItemsAsStrings.includes(itemId.toString());
    return isBorrowed;
  }
}
