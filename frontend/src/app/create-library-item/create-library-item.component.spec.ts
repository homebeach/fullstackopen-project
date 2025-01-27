import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { CreateLibraryItemComponent } from './create-library-item.component';
import { LibraryService } from '../services/library.service';
import { LibraryItemType } from '../models/library-item.model';

describe('CreateLibraryItemComponent', () => {
  let component: CreateLibraryItemComponent;
  let fixture: ComponentFixture<CreateLibraryItemComponent>;
  let libraryServiceSpy: jasmine.SpyObj<LibraryService>;

  beforeEach(async () => {
	// Create a spy for the LibraryService
	const libraryServiceMock = jasmine.createSpyObj('LibraryService', ['setLibraryItems']);

	await TestBed.configureTestingModule({
		imports: [CreateLibraryItemComponent, FormsModule], // Import the standalone component
		providers: [
		{ provide: LibraryService, useValue: libraryServiceMock },
		],
	}).compileComponents();

	fixture = TestBed.createComponent(CreateLibraryItemComponent);
	component = fixture.componentInstance;
	libraryServiceSpy = TestBed.inject(LibraryService) as jasmine.SpyObj<LibraryService>;
	fixture.detectChanges(); // Trigger initial binding
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.libraryItem).toEqual({
      title: '',
      author: '',
      publishedDate: '',
      genre: '',
      type: LibraryItemType.Book,
      copiesAvailable: 1,
    });
    expect(component.mode).toBe('single');
    expect(component.successMessage).toBe('');
    expect(component.errorMessage).toBe('');
  });

  it('should reset the single form after successful submission', () => {
	libraryServiceSpy.setLibraryItems.and.returnValue(of([])); // Simulates success

	component.onSubmitSingle();

	expect(libraryServiceSpy.setLibraryItems).toHaveBeenCalledWith([component.libraryItem]);
	expect(component.successMessage).toBe('Library item created successfully!');
	expect(component.errorMessage).toBe('');
	expect(component.libraryItem).toEqual({
		title: '',
		author: '',
		publishedDate: '',
		genre: '',
		type: LibraryItemType.Book,
		copiesAvailable: 1,
	});
  });

  it('should handle errors when submitting a single item', () => {
    libraryServiceSpy.setLibraryItems.and.returnValue(throwError(() => ({ error: { message: 'Test error' } })));

    component.onSubmitSingle();

    expect(libraryServiceSpy.setLibraryItems).toHaveBeenCalled();
    expect(component.errorMessage).toBe('Test error');
    expect(component.successMessage).toBe('');
  });

  it('should submit batch items successfully', () => {
	const batchInput = JSON.stringify([
		{
		title: 'Book 1',
		author: 'Author 1',
		publishedDate: '2025-01-01',
		genre: 'Fiction',
		type: LibraryItemType.Book,
		copiesAvailable: 3,
		},
	]);
	libraryServiceSpy.setLibraryItems.and.returnValue(of([])); // Simulates success

	component.batchInput = batchInput;
	component.onSubmitBatch();

	expect(libraryServiceSpy.setLibraryItems).toHaveBeenCalledWith(JSON.parse(batchInput));
	expect(component.successMessage).toBe('Batch library items created successfully!');
	expect(component.errorMessage).toBe('');
	expect(component.batchInput).toBe('');
  });

  it('should handle invalid JSON input for batch submission', () => {
    component.batchInput = 'invalid json';

    component.onSubmitBatch();

    expect(component.errorMessage).toContain('Invalid JSON input');
    expect(component.successMessage).toBe('');
    expect(libraryServiceSpy.setLibraryItems).not.toHaveBeenCalled();
  });

  it('should handle errors when submitting batch items', () => {
    const batchInput = JSON.stringify([
      {
        title: 'Book 1',
        author: 'Author 1',
        publishedDate: '2025-01-01',
        genre: 'Fiction',
        type: LibraryItemType.Book,
        copiesAvailable: 3,
      },
    ]);
    libraryServiceSpy.setLibraryItems.and.returnValue(throwError(() => ({ error: { message: 'Batch error' } })));

    component.batchInput = batchInput;
    component.onSubmitBatch();

    expect(libraryServiceSpy.setLibraryItems).toHaveBeenCalled();
    expect(component.errorMessage).toBe('Batch error');
    expect(component.successMessage).toBe('');
  });

  it('should reset the single form correctly', () => {
    component.libraryItem = {
      title: 'Sample',
      author: 'Author',
      publishedDate: '2025-01-01',
      genre: 'Fiction',
      type: LibraryItemType.Book,
      copiesAvailable: 1,
    };

    component['resetSingleForm']();

    expect(component.libraryItem).toEqual({
      title: '',
      author: '',
      publishedDate: '',
      genre: '',
      type: LibraryItemType.Book,
      copiesAvailable: 1,
    });
  });

  it('should reset the batch input correctly', () => {
    component.batchInput = 'Some JSON';
    component['resetBatchInput']();

    expect(component.batchInput).toBe('');
  });
});
