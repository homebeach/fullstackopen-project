import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-my-borrowed-items',
  standalone: true,
  imports: [],
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

    this.http.get<any[]>('/api/library/borrowed', { headers }).subscribe({
      next: (data) => {
        this.borrowedItems = data;
      },
      error: (error) => {
        this.errorMessage = error.error || 'Failed to fetch borrowed items.';
      },
    });
  }
}
