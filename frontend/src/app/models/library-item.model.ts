export enum LibraryItemType {
  Book = 'Book',
  Magazine = 'Magazine',
  CD = 'CD',
  DVD = 'DVD',
  BluRay = 'Blu-ray',
}

export interface LibraryItem {
  id?: number;
  title: string;
  author: string;
  publishedDate: string; // ISO date string format (e.g., "2025-01-14")
  genre: string;
  type: LibraryItemType; // Use the enum for the type property
  copiesAvailable: number;
  createdAt?: string; // Add createdAt as optional
  updatedAt?: string; // Add updatedAt as optional
}
