import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LibraryService } from './library.service';
import { LibraryItem, LibraryItemType } from '../models/library-item.model';
import { environment } from '../../environments/environment';

describe('LibraryService', () => {
  let service: LibraryService;
  let httpTestingController: HttpTestingController;

  const mockApiUrl = `${environment.apiBaseUrl}/api/library`;
  const mockToken = 'mock-token';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LibraryService],
    });

    service = TestBed.inject(LibraryService);
    httpTestingController = TestBed.inject(HttpTestingController);

    // Mock localStorage to return a token
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'token') {
        return mockToken;
      }
      return null;
    });
  });

  afterEach(() => {
    httpTestingController.verify(); // Ensure no outstanding HTTP requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getLibraryItems', () => {
    it('should fetch library items', () => {
      const mockLibraryItems: LibraryItem[] = [
        {
          id: 1,
          title: 'Book A',
          author: 'Author A',
          publishedDate: '',
          genre: '',
          type: LibraryItemType.Book, // Updated to use enum
          copiesAvailable: 0,
        },
        {
          id: 2,
          title: 'Book B',
          author: 'Author B',
          publishedDate: '',
          genre: '',
          type: LibraryItemType.Book, // Updated to use enum
          copiesAvailable: 0,
        },
      ];

      service.getLibraryItems().subscribe((libraryItems) => {
        expect(libraryItems).toEqual(mockLibraryItems);
      });

      const req = httpTestingController.expectOne(mockApiUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush(mockLibraryItems);
    });
  });

  describe('#setLibraryItems', () => {
    it('should set library items', () => {
      const mockLibraryItems: LibraryItem[] = [
        {
          id: 1,
          title: 'Book A',
          author: 'Author A',
          publishedDate: '',
          genre: '',
          type: LibraryItemType.Book, // Updated to use enum
          copiesAvailable: 0,
        },
        {
          id: 2,
          title: 'Book B',
          author: 'Author B',
          publishedDate: '',
          genre: '',
          type: LibraryItemType.Book, // Updated to use enum
          copiesAvailable: 0,
        },
      ];

      service.setLibraryItems(mockLibraryItems).subscribe((response) => {
        expect(response).toEqual(mockLibraryItems);
      });

      const req = httpTestingController.expectOne(mockApiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.body).toEqual(mockLibraryItems);
      req.flush(mockLibraryItems);
    });
  });
});
