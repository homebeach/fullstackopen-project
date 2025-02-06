import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LibraryService } from '../services/library.service';
import { LibraryItemType } from '../models/library-item.model';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { LibraryListComponent } from './library-list.component';

describe('LibraryListComponent', () => {
  let component: LibraryListComponent;
  let fixture: ComponentFixture<LibraryListComponent>;
  let libraryServiceMock: jasmine.SpyObj<LibraryService>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    libraryServiceMock = jasmine.createSpyObj('LibraryService', ['getLibraryItems']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([/* routes if needed */]), LibraryListComponent],  // Import standalone component
      providers: [{ provide: LibraryService, useValue: libraryServiceMock }],
    });

    fixture = TestBed.createComponent(LibraryListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    // Mock data
    libraryServiceMock.getLibraryItems.and.returnValue(
      of([
        { id: 1, title: 'Book 1', author: 'Author 1', publishedDate: '2020-01-01', genre: 'Fiction', type: LibraryItemType.Book, copiesAvailable: 3 },
        { id: 2, title: 'Book 2', author: 'Author 2', publishedDate: '2021-02-02', genre: 'Non-fiction', type: LibraryItemType.Book, copiesAvailable: 2 },
      ])
    );

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    libraryServiceMock.getLibraryItems.calls.reset();
  });

  it('should load library items on init', () => {
    expect(component.libraryItems.length).toBe(2);
    expect(component.libraryItems[0].title).toBe('Book 1');
  });

  it('should handle error when fetching library items', fakeAsync(() => {
    libraryServiceMock.getLibraryItems.and.returnValue(throwError(() => new Error('API error')));
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    expect(component.errorMessage).toBe('Failed to fetch library items');
  }));

  it('should load borrowed items from localStorage', () => {
    localStorage.setItem('borrowedItems', JSON.stringify([1, 2]));
    component.loadBorrowedItems();

    console.log("component.borrowedItems");
    console.log(component.borrowedItems);


    expect(component.borrowedItems).toEqual(['1', '2']); // Keep them as strings
  });

  it('should update borrowed items and availability when borrowing an item', fakeAsync(() => {
    // Mock the initial token and borrowed items in localStorage
    localStorage.setItem('token', 'mockToken');
    localStorage.setItem('borrowedItems', JSON.stringify([1])); // Initial borrowed item

    // Mock library items
    component.libraryItems = [
      { id: 1, title: 'Book 1', author: 'Author 1', publishedDate: '2025-01-01', genre: 'Fiction', type: LibraryItemType.Book, copiesAvailable: 3 },
      { id: 2, title: 'Book 2', author: 'Author 2', publishedDate: '2025-01-02', genre: 'Non-Fiction', type: LibraryItemType.Book, copiesAvailable: 2 },
    ];

    // Load borrowed items from localStorage
    component.loadBorrowedItems();

    expect(component.borrowedItems).toEqual(['1']); // Ensure initial borrowed items are loaded correctly

    // Borrow another item
    component.borrowItem(2);

    // Simulate the HTTP response for borrowing the item
    const postRequest = httpMock.expectOne(`${component.baseUrl}/api/borrowItem/2/borrow`);
    postRequest.flush({}); // Simulate a successful response

    // Ensure all async operations complete
    tick();

    // Load borrowed items again to reflect the updates
    component.loadBorrowedItems();

    // Verify the assertions
    expect(component.borrowedItems).toEqual(['1', '2']); // Ensure the borrowed item is added as a string
    expect(component.libraryItems[1].copiesAvailable).toBe(1); // Check the copiesAvailable is reduced
    expect(localStorage.getItem('borrowedItems')).toBe(JSON.stringify(['1', '2'])); // Ensure localStorage is updated
  }));

  it('should handle borrowing item without token', () => {
    localStorage.removeItem('token');
    component.borrowItem(1);
    expect(component.errorMessage).toBe('Please log in to borrow items.');
  });

  it('should check if an item is borrowed', () => {
    localStorage.setItem('borrowedItems', JSON.stringify([1]));
    component.loadBorrowedItems();
    expect(component.isItemBorrowed(1)).toBeTrue();
    expect(component.isItemBorrowed(2)).toBeFalse();
  });
});
