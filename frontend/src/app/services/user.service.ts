import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  user_type: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiBaseUrl}/api/users`; // Base URL for user-related endpoints

  constructor(private http: HttpClient) {}

  /**
   * Fetch all users.
   */
  getUsers(): Observable<User[]> {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No token found');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<User[]>(this.apiUrl, { headers });
  }

  /**
   * Fetch a specific user by ID.
   * @param id - The ID of the user.
   */
  getUserById(id: number): Observable<User> {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No token found');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<User>(`${this.apiUrl}/${id}`, { headers });
  }

  /**
   * Add a new user.
   * @param user - The user object to be created.
   */
  addUser(user: Partial<User> & { password: string }): Observable<User> {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No token found');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<User>(this.apiUrl, user, { headers });
  }

  /**
   * Update a user by username.
   * Only the logged-in user can update their own account.
   * @param username - The username of the user to be updated.
   * @param updates - The updates to be made to the user.
   */
  updateUser(
    username: string,
    updates: Partial<User> & { newPassword?: string }
  ): Observable<{ message: string; user: { username: string } }> {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No token found');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<{ message: string; user: { username: string } }>(
      `${this.apiUrl}/${username}`,
      updates,
      { headers }
    );
  }

  /**
   * Delete a user by ID.
   * @param id - The ID of the user to be deleted.
   */
  deleteUser(id: number): Observable<void> {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No token found');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }
}
