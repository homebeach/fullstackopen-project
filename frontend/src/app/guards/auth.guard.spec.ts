import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    // Mock the Router service
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: routerMock }, // Provide mock router
      ],
    });

    // Get an instance of the guard
    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access if user is logged in', () => {
    // Simulate logged-in state
    spyOn(localStorage, 'getItem').and.returnValue('true');

    const result = guard.canActivate();
    expect(result).toBeTrue(); // Should return true if logged in
    expect(routerMock.navigate).not.toHaveBeenCalled(); // No navigation should occur
  });

  it('should block access and redirect to login if user is not logged in', () => {
    // Simulate logged-out state
    spyOn(localStorage, 'getItem').and.returnValue(null);

    const result = guard.canActivate();
    expect(result).toBeFalse(); // Should return false if not logged in
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']); // Should navigate to login
  });

});
