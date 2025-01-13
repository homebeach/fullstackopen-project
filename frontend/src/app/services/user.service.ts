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
  disabled: boolean;
  password: string; // Updated field to match backend
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
   * Update a user by ID.
   * Allows updating user details, including the `disabled` status and password.
   * @param id - The ID of the user to be updated.
   * @param updates - The updates to be made to the user.
   */
  updateUser(
    id: number,
    updates: Partial<User> & { newPassword?: string }
  ): Observable<{ message: string; user: { id: number; username: string } }> {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No token found');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Prepare the request body to include the user updates, including password if provided
    const updatePayload: any = { ...updates };

    // If there's a new password, include it in the update payload
    if (updates.newPassword) {
      updatePayload.password = updates.newPassword;
    }

    return this.http.put<{ message: string; user: { id: number; username: string } }>(
      `${this.apiUrl}/${id}`,
      updatePayload,
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
