import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyBorrowedItemsComponent } from './my-borrowed-items.component';
import { BorrowService } from '../services/borrow.service';
import { of, throwError } from 'rxjs';
import { LibraryItem, LibraryItemType } from '../models/library-item.model';
import { CommonModule } from '@angular/common';

describe('MyBorrowedItemsComponent', () => {
  let component: MyBorrowedItemsComponent;
  let fixture: ComponentFixture<MyBorrowedItemsComponent>;
  let borrowService: jasmine.SpyObj<BorrowService>;

  beforeEach(() => {
    const borrowServiceSpy = jasmine.createSpyObj('BorrowService', ['fetchBorrowedItems', 'returnItem']);

    TestBed.configureTestingModule({
      imports: [CommonModule], // Import CommonModule as it's used in the standalone component
      providers: [{ provide: BorrowService, useValue: borrowServiceSpy }],
    });

    fixture = TestBed.createComponent(MyBorrowedItemsComponent);
    component = fixture.componentInstance;
    borrowService = TestBed.inject(BorrowService) as jasmine.SpyObj<BorrowService>;

    // Mocking localStorage
    spyOn(localStorage, 'setItem');
  });

  describe('fetchBorrowedItems', () => {
    it('should fetch borrowed items and store them in localStorage', () => {
      const mockItems: LibraryItem[] = [
        { id: 1, title: 'Book 1', author: 'Author 1', publishedDate: '2023-01-01', genre: 'Fiction', type: LibraryItemType.Book, copiesAvailable: 5 },
        { id: 2, title: 'Book 2', author: 'Author 2', publishedDate: '2023-01-02', genre: 'Non-Fiction', type: LibraryItemType.Book, copiesAvailable: 3 },
      ];

      // Ensure fetchBorrowedItems is returning a mock observable
      borrowService.fetchBorrowedItems.and.returnValue(of(mockItems));

      component.fetchBorrowedItems();
      fixture.detectChanges();

      expect(component.borrowedItems).toEqual(mockItems);
      expect(localStorage.setItem).toHaveBeenCalledWith('borrowedItems', JSON.stringify([1, 2]));
    });

    it('should handle error response and set errorMessage', () => {
      const error = new Error('Failed to fetch borrowed items.');

      // Ensure fetchBorrowedItems returns an error observable
      borrowService.fetchBorrowedItems.and.returnValue(throwError(() => error));

      component.fetchBorrowedItems();
      fixture.detectChanges();

      expect(component.errorMessage).toBe('Failed to fetch borrowed items.');
    });
  });

  describe('returnItem', () => {
    it('should return an item and update borrowed items', () => {
      const itemId = 1;
      const mockItems: LibraryItem[] = [
        { id: 1, title: 'Book 1', author: 'Author 1', publishedDate: '2023-01-01', genre: 'Fiction', type: LibraryItemType.Book, copiesAvailable: 5 },
      ];

      // Mock returnItem and fetchBorrowedItems
      borrowService.returnItem.and.returnValue(of(undefined)); // Simulate successful return
      borrowService.fetchBorrowedItems.and.returnValue(of(mockItems));

      component.returnItem(itemId);
      fixture.detectChanges();

      expect(borrowService.returnItem).toHaveBeenCalledWith(itemId);
      expect(component.borrowedItems).toEqual(mockItems);
    });

    it('should handle error response when returning an item and set errorMessage', () => {
      const itemId = 1;
      const error = new Error('Failed to return the item.');

      // Ensure returnItem and fetchBorrowedItems return error observables
      borrowService.returnItem.and.returnValue(throwError(() => error));
      borrowService.fetchBorrowedItems.and.returnValue(of([])); // Mocking empty response for fetchBorrowedItems to prevent undefined

      component.returnItem(itemId);
      fixture.detectChanges();

      expect(component.errorMessage).toBe('Failed to return the item.');
    });
  });

  describe('ngOnInit', () => {
    it('should fetch borrowed items on init', () => {
      const mockItems: LibraryItem[] = [
        { id: 1, title: 'Book 1', author: 'Author 1', publishedDate: '2023-01-01', genre: 'Fiction', type: LibraryItemType.Book, copiesAvailable: 5 },
        { id: 2, title: 'Book 2', author: 'Author 2', publishedDate: '2023-01-02', genre: 'Non-Fiction', type: LibraryItemType.Book, copiesAvailable: 3 },
      ];

      borrowService.fetchBorrowedItems.and.returnValue(of(mockItems));

      component.ngOnInit(); // Manually trigger ngOnInit
      fixture.detectChanges();

      expect(component.borrowedItems).toEqual(mockItems);
    });
  });
});
