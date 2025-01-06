import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LibraryListComponent } from './library-list/library-list.component';
import { AuthGuard } from './auth.guard';
import { RedirectGuard } from './redirect.guard';
import { MainLayoutComponent } from './main-layout/main-layout.component';

export class PlaceholderComponent {}

export const routes: Routes = [
  // Redirect to login or default route
  {
    path: '',
    component: PlaceholderComponent,
    canActivate: [RedirectGuard],
    pathMatch: 'full',
  },
  // Login route
  { path: 'login', component: LoginComponent },
  // Routes under the MainLayout with the global menu
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'library-list', component: LibraryListComponent },
    ],
  },
];
