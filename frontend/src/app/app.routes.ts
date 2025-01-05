import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LibraryListComponent } from './library-list/library-list.component';
import { AuthGuard } from './auth.guard';
import { RedirectGuard } from './redirect.guard';
import { Component } from '@angular/core'; // For placeholder component

@Component({
  template: '',
})
export class PlaceholderComponent {}

export const routes: Routes = [
  {
    path: '',
    component: PlaceholderComponent,
    canActivate: [RedirectGuard],
    pathMatch: 'full'
  },
  { path: 'login', component: LoginComponent },
  { path: 'library-list', component: LibraryListComponent, canActivate: [AuthGuard] },
];
