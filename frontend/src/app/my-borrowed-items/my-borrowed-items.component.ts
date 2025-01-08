import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Import CommonModule for Angular pipes like date

@Component({
  selector: 'app-my-borrowed-items',
  standalone: true,
  imports: [CommonModule], // Include CommonModule to enable date pipe
  templateUrl: './my-borrowed-items.component.html',
  styleUrls: ['./my-borrowed-items.component.css'],
})
export class MyBorrowedItemsComponent implements OnInit {
  borrowedItems: any[] = [];
  errorMessage: string = '';

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

    this.http.get<any[]>('http://localhost:3001/api/library/borrowed', { headers }).subscribe({
      next: (data) => {
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
};
