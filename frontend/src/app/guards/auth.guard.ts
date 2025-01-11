import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: any) {}

  canActivate(): boolean {
    console.log('AuthGuard invoked');

    // Check if the platform is the browser
    if (isPlatformBrowser(this.platformId)) {
      console.log('Running in browser environment');

      try {
        const token = localStorage.getItem('token'); // Check for token
        console.log('Is token present?', !!token);

        if (!token) {
          console.warn('No token found. Redirecting to /login');
          this.router.navigate(['/login']);
          return false;
        }

        console.log('Token found. Allowing access');
        return true; // User is authenticated, allow access
      } catch (error) {
        console.error('Error accessing localStorage:', error);
        this.router.navigate(['/login']);
        return false;
      }
    } else {
      console.warn('Running in non-browser environment. Redirecting to /login');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
