import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyAccountComponent } from './my-account.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserService } from '../services/user.service';
import { of, throwError } from 'rxjs';
import { User } from '../models/user.model';

describe('MyAccountComponent', () => {
  let component: MyAccountComponent;
  let fixture: ComponentFixture<MyAccountComponent>;
  let userServiceMock: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    userServiceMock = jasmine.createSpyObj('UserService', ['getUserById', 'updateUser']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule, // Import HttpClientTestingModule for HTTP calls
      ],
      providers: [
        { provide: UserService, useValue: userServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data on initialization', () => {
    const userData = {
      id: 1,
      username: 'testUser',
      firstname: 'John',
      lastname: 'Doe',
      user_type: 'admin',
      created_at: '2025-01-01T00:00:00Z',
      disabled: false,
      password: 'password123',
    };

    // Mock localStorage and userService
    spyOn(localStorage, 'getItem').and.returnValue('1'); // Simulate userId in localStorage
    userServiceMock.getUserById.and.returnValue(of(userData)); // Simulate successful user fetch

    component.ngOnInit(); // Trigger component initialization

    // Verify the user data and service call
    expect(component.user).toEqual(userData);
    expect(userServiceMock.getUserById).toHaveBeenCalledOnceWith(1); // Ensure service was called with id 1
  });

  it('should set error message if user data update fails', () => {
    // Simulate failure of updateUser
    userServiceMock.updateUser.and.returnValue(throwError('Error updating user data'));

    component.onSubmit(); // Trigger form submission

    // Expect the error message set in the component
    expect(component.errorMessage).toBe('Failed to update user data.');
  });


  it('should update user data successfully on submit', () => {
    const updatedUserData: User = {
      id: 1,
      username: 'newUser',
      firstname: 'Jane',
      lastname: 'Smith',
      user_type: 'admin',
      created_at: '2025-01-01T00:00:00Z',
      disabled: false,
      password: 'newPassword123',
    };

    const response = {
      message: 'User data updated successfully.',
      user: { id: updatedUserData.id, username: updatedUserData.username },
    };

    userServiceMock.updateUser.and.returnValue(of(response)); // Simulate successful user update

    component.user = { ...updatedUserData }; // Spread the updated data
    component.onSubmit(); // Trigger form submission

    expect(component.successMessage).toBe('User data updated successfully.');
    expect(component.errorMessage).toBe('');
  });

  it('should set error message if user data update fails', () => {
    userServiceMock.updateUser.and.returnValue(throwError('Error updating user data')); // Simulate failure

    component.onSubmit(); // Trigger form submission

    expect(component.errorMessage).toBe('Failed to update user data.'); // Match the actual message in the component
  });

  it('should change password successfully', () => {
    const newPassword = 'newPassword123';

    // Simulate successful password change with message
    const response = {
      message: 'Password changed successfully.',
      user: { id: 1, username: 'existingUser' } // Example user
    };

    userServiceMock.updateUser.and.returnValue(of(response)); // Simulate response

    component.user = {
      id: 1,
      username: 'existingUser',
      firstname: 'Test',
      lastname: 'User',
      user_type: '',
      created_at: '',
      disabled: false,
      password: ''
    };

    component.changePassword({ newPassword });

    expect(component.successMessage).toBe('Password changed successfully.');
    expect(component.errorMessage).toBe('');
  });


  it('should set error message if password change fails', () => {
    // Ensure user is set up
    component.user = {
      id: 1,
      username: '',
      firstname: '',
      lastname: '',
      user_type: '',
      created_at: '',
      disabled: false,
      password: '',
    };

    // Simulate failure of updateUser
    userServiceMock.updateUser.and.returnValue(throwError('Error changing password'));

    component.changePassword({ newPassword: 'newPassword123' }); // Trigger password change

    expect(component.errorMessage).toBe('Failed to update password.'); // Match the component logic
  });
});
