export enum LibraryItemType {
  Book = 'Book',
  Magazine = 'Magazine',
  CD = 'CD',
  DVD = 'DVD',
  BluRay = 'Blu-ray', // Enum values must match the original literal types
}

export interface LibraryItem {
  id?: number; // Optional for new items being created
  title: string;
  author: string;
  publishedDate: string; // ISO date string format (e.g., "2025-01-14")
  genre: string;
  type: LibraryItemType; // Use the enum for the type property
  copiesAvailable: number;
}
