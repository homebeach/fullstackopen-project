import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LibraryItem } from '../models/library-item.model';
import { environment } from '../../environments/environment'; // Import environment file

@Injectable({
  providedIn: 'root',
})
export class LibraryService {
  private apiUrl = `${environment.apiBaseUrl}/api/library`; // Use base URL from environment

  constructor(private http: HttpClient) {}

  // Get all library items
  getLibraryItems(): Observable<LibraryItem[]> {
    const token = localStorage.getItem('token'); // Get token from localStorage

    if (!token) {
      throw new Error('No token found');
    }

    // Set the Authorization header with the token
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Include headers in the HTTP request
    return this.http.get<LibraryItem[]>(this.apiUrl, { headers });
  }

  // Set library items (replace existing items)
  setLibraryItems(libraryItems: LibraryItem[]): Observable<LibraryItem[]> {
    const token = localStorage.getItem('token'); // Get token from localStorage

    if (!token) {
      throw new Error('No token found');
    }

    // Set the Authorization header with the token
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Send the library items through a POST request
    return this.http.post<LibraryItem[]>(this.apiUrl, libraryItems, { headers });
  }
}
