import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LibraryItem } from './library-item.model';

@Injectable({
  providedIn: 'root',
})
export class LibraryService {
  private apiUrl = 'https://fullstackopen-project-arik.onrender.com/api/library';

  constructor(private http: HttpClient) {}

  getLibraryItems(): Observable<LibraryItem[]> {
    return this.http.get<LibraryItem[]>(this.apiUrl);
  }
}
