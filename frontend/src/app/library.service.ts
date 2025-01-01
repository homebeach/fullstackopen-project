// src/app/library.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LibraryService {
  private apiUrl = 'http://localhost:3001/api/libraryItems';

  constructor(private http: HttpClient) {}

  getLibraryItems(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
