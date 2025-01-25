import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BorrowService } from './borrow.service';
import { environment } from '../../environments/environment';
import { LibraryItem, LibraryItemType } from '../models/library-item.model';

describe('BorrowService', () => {
  let service: BorrowService;
  let httpMock: HttpTestingController;

  const mockBorrowedItems: LibraryItem[] = [
    {
      id: 1,
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      publishedDate: '1925-04-10',
      genre: 'Classic',
      type: LibraryItemType.Book, // Updated to use enum
      copiesAvailable: 3,
    },
    {
      id: 2,
      title: 'The Matrix',
      author: 'Wachowskis',
      publishedDate: '1999-03-31',
      genre: 'Science Fiction',
      type: LibraryItemType.DVD, // Updated to use enum
      copiesAvailable: 1,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BorrowService],
    });
    service = TestBed.inject(BorrowService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding HTTP requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('fetchBorrowedItems', () => {
    it('should fetch borrowed items successfully', () => {
      const token = 'mock-token';
      spyOn(localStorage, 'getItem').and.returnValue(token);

      service.fetchBorrowedItems().subscribe((items) => {
        expect(items).toEqual(mockBorrowedItems);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/library/borrowed`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush(mockBorrowedItems);
    });

    it('should throw an error if no token is found', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);

      expect(() => {
        service.fetchBorrowedItems().subscribe();
      }).toThrowError('No token found. User is not authenticated.');
    });

    it('should handle error response', () => {
      const token = 'mock-token';
      spyOn(localStorage, 'getItem').and.returnValue(token);

      service.fetchBorrowedItems().subscribe({
        next: () => fail('Should have failed with an error'),
        error: (error) => {
          expect(error.message).toBe('Failed to fetch borrowed items.');
        },
      });

      // Simulate the server error response
      const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/library/borrowed`);
      expect(req.request.method).toBe('GET');
      req.flush('Internal Server Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('returnItem', () => {
    it('should return an item successfully', () => {
      const token = 'mock-token';
      spyOn(localStorage, 'getItem').and.returnValue(token);

      const itemId = 1;

      service.returnItem(itemId).subscribe(() => {
        expect(true).toBeTrue(); // Success case
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/borrowItem/${itemId}/return`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush({});
    });

    it('should throw an error if no token is found', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);

      expect(() => {
        service.returnItem(1).subscribe();
      }).toThrowError('No token found. User is not authenticated.');
    });

    it('should handle error response', () => {
      const token = 'mock-token';
      spyOn(localStorage, 'getItem').and.returnValue(token);

      const itemId = 1;

      service.returnItem(itemId).subscribe({
        next: () => fail('Should have failed with an error'),
        error: (error) => {
          expect(error.message).toBe('Could not return the item. Please try again.');
        },
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/borrowItem/${itemId}/return`);
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });
});
