import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LibraryService } from '../services/library.service';
import { LibraryItem } from '../models/library-item.model';

@Component({
  selector: 'app-create-library-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-library-item.component.html',
  styleUrls: ['./create-library-item.component.css'],
})
export class CreateLibraryItemComponent {
  libraryItem: LibraryItem = {
    title: '',
    author: '',
    publishedDate: '',
    genre: '',
    type: 'Book',
    copiesAvailable: 1,
  };

  batchInput: string = ''; // For batch insert JSON
  acceptedTypes: LibraryItem['type'][] = ['Book', 'Magazine', 'CD', 'DVD', 'Blu-ray'];
  mode: 'single' | 'batch' = 'single'; // Dropdown selection

  successMessage: string = '';
  errorMessage: string = '';

  constructor(private libraryService: LibraryService) {}

  onSubmitSingle(): void {
    this.libraryService.setLibraryItems([this.libraryItem]).subscribe({
      next: () => {
        this.successMessage = 'Library item created successfully!';
        this.errorMessage = '';
        this.resetSingleForm();
      },
      error: (error: any) => {
        this.handleError(error);
      },
    });
  }

  onSubmitBatch(): void {
    let batchItems: LibraryItem[];
    try {
      batchItems = JSON.parse(this.batchInput);

      if (!Array.isArray(batchItems)) {
        throw new Error('Input must be a JSON array.');
      }

      this.libraryService.setLibraryItems(batchItems).subscribe({
        next: () => {
          this.successMessage = 'Batch library items created successfully!';
          this.errorMessage = '';
          this.resetBatchInput();
        },
        error: (error: any) => {
          this.handleError(error);
        },
      });
    } catch (error: any) {
      this.errorMessage = `Invalid JSON input: ${error.message}`;
      this.successMessage = '';
    }
  }

  private resetSingleForm(): void {
    this.libraryItem = {
      title: '',
      author: '',
      publishedDate: '',
      genre: '',
      type: 'Book',
      copiesAvailable: 1,
    };
  }

  private resetBatchInput(): void {
    this.batchInput = '';
  }

  private handleError(error: any): void {
    console.error('Error occurred:', error);
    this.errorMessage = error?.error?.message || 'An unexpected error occurred. Please try again.';
    this.successMessage = '';
  }
}
