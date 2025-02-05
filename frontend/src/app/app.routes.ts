import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LibraryListComponent } from './library-list/library-list.component';
import { AuthGuard } from './guards/auth.guard';
import { RedirectGuard } from './guards/redirect.guard';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { MyBorrowedItemsComponent } from './my-borrowed-items/my-borrowed-items.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { CreateLibraryItemComponent } from './create-library-item/create-library-item.component';


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
      { path: 'create-library-item', component: CreateLibraryItemComponent },
      { path: 'borrowed', component: MyBorrowedItemsComponent },
      { path: 'my-account', component: MyAccountComponent },
      { path: 'user-management', component: UserManagementComponent },
    ],
  },
];
