import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuBarComponent } from '../menu-bar/menu-bar.component'; // Import MenuBarComponent if standalone

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, MenuBarComponent], // Include RouterModule and MenuBarComponent
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
})
export class MainLayoutComponent {}
