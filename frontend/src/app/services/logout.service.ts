import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LogoutService {
  private apiUrl = `${environment.apiBaseUrl}/api/logout`; // Logout endpoint

  constructor(private http: HttpClient) {}

  /**
   * Logs the user out by sending a DELETE request to the logout endpoint.
   * @returns An observable for the HTTP DELETE request.
   */
  logout(): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(this.apiUrl, { headers });
  }
}
