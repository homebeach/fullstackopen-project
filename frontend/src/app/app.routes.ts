import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LibraryListComponent } from './library-list/library-list.component';
import { AuthGuard } from './guards/auth.guard';
import { RedirectGuard } from './guards/redirect.guard';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { MyBorrowedItemsComponent } from './my-borrowed-items/my-borrowed-items.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { UserManagementComponent } from './user-management/user-management.component'; // Import UserManagementComponent

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
      { path: 'borrowed', component: MyBorrowedItemsComponent },
      { path: 'user-management', component: UserManagementComponent }, // New route for User Management
    ],
  },
];
