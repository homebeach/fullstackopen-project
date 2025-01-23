import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BorrowService } from '../services/borrow.service';
import { LibraryItem } from '../models/library-item.model';

@Component({
  selector: 'app-my-borrowed-items',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-borrowed-items.component.html',
  styleUrls: ['./my-borrowed-items.component.css'],
})
export class MyBorrowedItemsComponent implements OnInit {
  borrowedItems: LibraryItem[] = [];
  errorMessage: string = '';

  constructor(private borrowService: BorrowService) {}

  ngOnInit(): void {
    this.fetchBorrowedItems();
  }

  fetchBorrowedItems(): void {
    this.borrowService.fetchBorrowedItems().subscribe({
      next: (data: LibraryItem[]) => {
        this.borrowedItems = data;

        const borrowedItemIds = data.map((item) => item.id);
        localStorage.setItem('borrowedItems', JSON.stringify(borrowedItemIds));
      },
      error: (error) => {
        this.errorMessage = error.message;
      },
    });
  }

  returnItem(itemId: number): void {
    this.borrowService.returnItem(itemId).subscribe({
      next: () => {
        console.log(`Item with ID ${itemId} returned successfully`);
        this.fetchBorrowedItems();
      },
      error: (error) => {
        this.errorMessage = error.message;
      },
    });
  }
}
