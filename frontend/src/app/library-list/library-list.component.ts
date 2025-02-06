import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LibraryService } from '../services/library.service';
import { LibraryItem } from '../models/library-item.model';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-library-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
    private http: HttpClient
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

  borrowItem(itemId?: number): void {
    if (itemId === undefined) {
      console.error("Item ID is undefined, cannot borrow.");
      this.errorMessage = "Invalid item selected.";
      return;
    }

    const url = `${this.baseUrl}/api/borrowItem/${itemId}/borrow`; // Use baseUrl from environment

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found. User is not authenticated.');
      this.errorMessage = 'Please log in to borrow items.';
      return;
    }

    // Set headers with the token
    const headers = { Authorization: `Bearer ${token}` };

    this.http.post(url, {}, { headers }).pipe(
      takeUntil(this.destroy$) // Automatically unsubscribe on component destroy
    ).subscribe({
      next: () => {
        console.log(`Item with ID ${itemId} borrowed successfully`);

        // Update the item's availability in the UI
        const borrowedItem = this.libraryItems.find((item) => item.id === itemId);
        if (borrowedItem) {
          borrowedItem.copiesAvailable -= 1;
        }

        this.borrowedItems.push(itemId.toString());

        localStorage.setItem('borrowedItems', JSON.stringify(this.borrowedItems));

        console.log(`Updated borrowedItems: ${this.borrowedItems}`);
      },
      error: (error) => {
        console.error('Failed to borrow item:', error);
        this.errorMessage = error.status === 401
          ? 'Unauthorized. Please log in again.'
          : 'Could not borrow the item. Please try again.';
      },
    });
  }

  isItemBorrowed(itemId?: number): boolean {
    if (!itemId) return false; // Return false if no valid ID is provided

    const borrowedItemsAsStrings = this.borrowedItems.map((id) => id.toString());
    return borrowedItemsAsStrings.includes(itemId.toString());
  }

}
