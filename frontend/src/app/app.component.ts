// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true, // AppComponent is standalone
  imports: [RouterOutlet], // Use RouterOutlet for routing
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'], // Correct styleUrls
})
export class AppComponent {
  title = 'frontend';
}
