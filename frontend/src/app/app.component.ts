import { Component } from '@angular/core';
import { LibraryListComponent } from './library-list/library-list.component';

@Component({
  selector: 'app-root',
  standalone: true, // AppComponent is a standalone component
  imports: [LibraryListComponent], // Add LibraryListComponent here
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'], // Fix: 'styleUrls' instead of 'styleUrl'
})
export class AppComponent {
  title = 'frontend';
}
