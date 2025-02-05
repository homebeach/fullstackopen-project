import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LogoutService } from './logout.service';
import { environment } from '../../environments/environment';

describe('LogoutService', () => {
  let service: LogoutService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LogoutService],
    });
    service = TestBed.inject(LogoutService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that there are no outstanding HTTP requests
    httpTestingController.verify();
  });

  it('#logout should make a DELETE request and complete successfully', () => {
    const token = 'mock-token';
    localStorage.setItem('token', token);

    service.logout().subscribe({
      next: () => {
        // Test passes if the observable completes without errors
        expect(true).toBeTrue();
      },
      error: () => {
        fail('Logout should not fail');
      },
    });

    // Expect a DELETE request
    const req = httpTestingController.expectOne(`${environment.apiBaseUrl}/api/logout`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);

    // Simulate a successful response
    req.flush(null);
  });

  it('#logout should handle server errors gracefully', () => {
    const token = 'mock-token';
    localStorage.setItem('token', token);

    service.logout().subscribe({
      next: () => {
        fail('Logout should not succeed when the server returns an error');
      },
      error: (error) => {
        // Ensure the error callback is triggered
        expect(error.status).toBe(500);
      },
    });

    // Expect a DELETE request
    const req = httpTestingController.expectOne(`${environment.apiBaseUrl}/api/logout`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);

    // Simulate a server error
    req.flush({ message: 'Internal Server Error' }, { status: 500, statusText: 'Internal Server Error' });
  });

});
