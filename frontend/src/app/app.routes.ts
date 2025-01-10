import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LibraryListComponent } from './library-list/library-list.component';
import { AuthGuard } from './auth.guard';
import { RedirectGuard } from './redirect.guard';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { MyBorrowedItemsComponent } from './my-borrowed-items/my-borrowed-items.component';
import { CreateUserComponent } from './create-user/create-user.component';

export class PlaceholderComponent {}

export const routes: Routes = [
  // Redirect to login or default route
  {
    path: '',
    component: PlaceholderComponent,
    canActivate: [RedirectGuard],
    pathMatch: 'full',
  },
  { path: 'create-user', component: CreateUserComponent },

  // Login route
  { path: 'login', component: LoginComponent },
  // Routes under the MainLayout with the global menu
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'library-list', component: LibraryListComponent },
      { path: 'borrowed', component: MyBorrowedItemsComponent }, // New route added here
    ],
  },
];
