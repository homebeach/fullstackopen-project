import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class RedirectGuard implements CanActivate {
  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: any) {}

  canActivate(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token'); // Check for authentication token
      if (token) {
        console.log('User is logged in. Redirecting to /library-list');
        this.router.navigate(['/library-list']);
      } else {
        console.log('User not logged in. Redirecting to /login');
        this.router.navigate(['/login']);
      }
      return false; // Prevent direct access to this route
    }
    console.warn('Running in non-browser environment. Redirecting to /login');
    this.router.navigate(['/login']);
    return false;
  }
}
