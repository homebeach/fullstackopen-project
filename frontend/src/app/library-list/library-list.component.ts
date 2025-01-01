// src/app/library-list/library-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for Angular directives
import { LibraryService } from '../library.service';

@Component({
  selector: 'app-library-list',
  standalone: true, // Mark as a standalone component
  imports: [CommonModule], // Import CommonModule for *ngFor, *ngIf, etc.
  templateUrl: './library-list.component.html',
  styleUrls: ['./library-list.component.css'],
})
export class LibraryListComponent implements OnInit {
  libraryItems: any[] = [];
  errorMessage: string = '';

  constructor(private libraryService: LibraryService) {}

  ngOnInit(): void {
    this.libraryService.getLibraryItems().subscribe(
      (items) => (this.libraryItems = items),
      (error) => (this.errorMessage = 'Failed to fetch library items')
    );
  }
}
