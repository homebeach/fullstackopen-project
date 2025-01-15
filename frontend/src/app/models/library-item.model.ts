export interface LibraryItem {
  id?: number; // Optional for new items being created
  title: string;
  author: string;
  publishedDate: string; // ISO date string format (e.g., "2025-01-14")
  genre: string;
  type: 'Book' | 'Magazine' | 'CD' | 'DVD' | 'Blu-ray'; // Restrict to ENUM values
  copiesAvailable: number;
}
