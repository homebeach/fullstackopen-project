// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LibraryListComponent } from './library-list/library-list.component';
import { AuthGuard } from './auth.guard'; // Protect library-list

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Default route redirects to login
  { path: 'login', component: LoginComponent },
  { path: 'library-list', component: LibraryListComponent, canActivate: [AuthGuard] }, // Protect library list
];
