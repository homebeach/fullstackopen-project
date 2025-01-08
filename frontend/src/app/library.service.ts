import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LibraryItem } from './library-item.model';

@Injectable({
  providedIn: 'root',
})
export class LibraryService {
  private apiUrl = 'https://fullstackopen-project-arik.onrender.com/api/library';

  constructor(private http: HttpClient) {}

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
}
