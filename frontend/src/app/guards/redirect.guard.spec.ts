import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RedirectGuard } from './redirect.guard';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

describe('RedirectGuard', () => {
  let guard: RedirectGuard;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        RedirectGuard,
        { provide: Router, useValue: routerSpy },
        { provide: PLATFORM_ID, useValue: 'browser' }, // Mock as running in browser
      ],
    });

    guard = TestBed.inject(RedirectGuard);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should redirect to /library-list and return false if token exists in localStorage', () => {
    localStorage.setItem('token', 'mock-token'); // Mock token in localStorage

    const result = guard.canActivate();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/library-list']);
    expect(result).toBeFalse();
  });

  it('should redirect to /login and return false if token does not exist in localStorage', () => {
    localStorage.removeItem('token'); // Ensure no token exists

    const result = guard.canActivate();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    expect(result).toBeFalse();
  });

  it('should redirect to /login and return false if running in a non-browser environment', () => {
    TestBed.resetTestingModule(); // Reset module to override PLATFORM_ID
    TestBed.configureTestingModule({
      providers: [
        RedirectGuard,
        { provide: Router, useValue: routerSpy },
        { provide: PLATFORM_ID, useValue: 'server' }, // Mock as running on the server
      ],
    });

    guard = TestBed.inject(RedirectGuard); // Re-inject guard with new PLATFORM_ID

    const result = guard.canActivate();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    expect(result).toBeFalse();
  });

  it('should warn and redirect to /login if isPlatformBrowser is mocked to false', () => {
    // Mock isPlatformBrowser to return false
    spyOn<any>(isPlatformBrowser, 'call').and.returnValue(false);

    const result = guard.canActivate();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    expect(result).toBeFalse();
  });

});
