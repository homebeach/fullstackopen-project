import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LibraryItem } from '../models/library-item.model';

@Injectable({
  providedIn: 'root',
})
export class BorrowService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found. User is not authenticated.');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  fetchBorrowedItems(): Observable<LibraryItem[]> {
    const url = `${this.baseUrl}/api/library/borrowed`;
    return this.http.get<LibraryItem[]>(url, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        // Log the original error for debugging purposes
        console.error('Error fetching borrowed items:', error);

        // Check if error is an instance of HttpErrorResponse and provide a custom message
        const errorMessage = error instanceof HttpErrorResponse
          ? 'Failed to fetch borrowed items.'
          : 'Unknown error occurred.';

        // Throw only a custom error message, not the entire error object
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  returnItem(itemId: number): Observable<void> {
    const url = `${this.baseUrl}/api/borrowItem/${itemId}/return`;
    return this.http.post<void>(url, {}, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error(`Error returning item with ID ${itemId}:`, error);
        return throwError(() => new Error('Could not return the item. Please try again.'));
      })
    );
  }
}
