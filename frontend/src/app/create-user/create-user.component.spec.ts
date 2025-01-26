import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CreateUserComponent } from './create-user.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { ActivatedRoute, RouterModule } from '@angular/router'; // Import ActivatedRoute
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { User } from '../models/user.model';

describe('CreateUserComponent', () => {
  let component: CreateUserComponent;
  let fixture: ComponentFixture<CreateUserComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    // Mock the UserService
    mockUserService = jasmine.createSpyObj('UserService', ['addUser']);

    mockUserService.addUser.and.returnValue(of({
      id: 1,
      username: 'testuser',
      firstname: 'Test',
      lastname: 'User',
      user_type: 'Customer',
      created_at: new Date().toISOString(),
      disabled: false,
      password: 'testpassword', // Use a dummy password
    }));

    // Mock the ActivatedRoute
    mockActivatedRoute = {
      snapshot: { params: { id: null } },
    };

    // Set up localStorage if required
    localStorage.setItem('userType', 'Customer'); // Simulate an authenticated user

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule, // Add FormsModule here
        CreateUserComponent,
        RouterModule
      ],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUserComponent);
    component = fixture.componentInstance;

    // Trigger lifecycle methods and change detection
    fixture.detectChanges();

  });

  describe('Form initialization', () => {

    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize the form with default values', () => {
      // Call ngOnInit only once to avoid unexpected behavior
      localStorage.removeItem('userType');

      component.ngOnInit();
      fixture.detectChanges();

      // Assert the default form values
      expect(component.userForm.getRawValue()).toEqual({
        username: '',
        firstname: '',
        lastname: '',
        user_type: 'Customer',
        password: '',
        confirmPassword: '',
      });
    });
  });


  describe('Form validation', () => {
    it('should require all fields to be filled', () => {
      component.userForm.setValue({
        username: '',
        firstname: '',
        lastname: '',
        user_type: 'Customer',
        password: '',
        confirmPassword: '',
      });
      expect(component.userForm.valid).toBeFalse();

      component.userForm.patchValue({
        username: 'user1',
        firstname: 'First',
        lastname: 'Last',
        password: 'password',
        confirmPassword: 'password',
      });
      expect(component.userForm.valid).toBeTrue();
    });

    it('should validate password and confirmPassword match', () => {
      component.userForm.patchValue({
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(component.userForm.errors).toBeNull();

      component.userForm.patchValue({
        password: 'password123',
        confirmPassword: 'password321',
      });

      expect(component.userForm.errors?.['passwordMismatch']).toBeTruthy(); // Updated
    });
  });

  describe('onSubmit', () => {
    it('should display an error message if the form is invalid', () => {
      component.userForm.setValue({
        username: '',
        firstname: '',
        lastname: '',
        user_type: 'Customer',
        password: '',
        confirmPassword: '',
      });
      component.onSubmit();

      expect(component.errorMessage).toBe('Please fill out all required fields.');
      expect(component.successMessage).toBe('');
    });

    it('should call addUser and display a success message on successful submission', () => {
      mockUserService.addUser.and.returnValue(
        of({
          id: 1,
          username: 'user1',
          firstname: 'First',
          lastname: 'Last',
          user_type: 'Customer',
          password: 'password123',
          created_at: '2025-01-25T00:00:00Z',
          disabled: false,
        })
      );

      component.userForm.setValue({
        username: 'user1',
        firstname: 'First',
        lastname: 'Last',
        user_type: 'Customer',
        password: 'password123',
        confirmPassword: 'password123',
      });

      component.ngOnInit();
      fixture.detectChanges();

      component.onSubmit();

      expect(mockUserService.addUser).toHaveBeenCalledWith({
        username: 'user1',
        firstname: 'First',
        lastname: 'Last',
        user_type: 'Customer',
        password: 'password123',
      });

      expect(component.successMessage).toBe('User created successfully!');
      expect(component.errorMessage).toBe('');
    });


    it('should display an error message if addUser fails', () => {
      mockUserService.addUser.and.returnValue(throwError({ error: { message: 'Failed to create user.' } }));

      component.userForm.setValue({
        username: 'user1',
        firstname: 'First',
        lastname: 'Last',
        user_type: 'Customer',
        password: 'password123',
        confirmPassword: 'password123',
      });

      component.onSubmit();

      expect(mockUserService.addUser).toHaveBeenCalled();
      expect(component.errorMessage).toBe('Failed to create user.');
      expect(component.successMessage).toBe('');
    });
  });

  describe('User type behavior', () => {
    it('should set available user types based on user role', () => {
      localStorage.setItem('userType', 'Admin');
      component.ngOnInit();
      expect(component.availableUserTypes).toEqual(['Customer', 'Librarian', 'Admin']);

      localStorage.setItem('userType', 'Librarian');
      component.ngOnInit();
      expect(component.availableUserTypes).toEqual(['Customer', 'Librarian']);

      localStorage.setItem('userType', 'Customer');
      component.ngOnInit();
      expect(component.availableUserTypes).toEqual(['Customer']);
    });

    it('should enable or disable the user_type field based on authentication', () => {
      localStorage.setItem('userType', 'Librarian');
      component.ngOnInit(); // Initialize form after setting localStorage
      fixture.detectChanges(); // Trigger UI updates
      expect(component.userForm.get('user_type')?.disabled).toBeFalse();

      localStorage.removeItem('userType');
      component.ngOnInit(); // Reinitialize form
      fixture.detectChanges(); // Trigger UI updates again

      expect(component.userForm.get('user_type')?.disabled).toBeTrue();
    });
  });

  describe('Form validation', () => {
    it('should require all fields to be filled', () => {
      component.userForm.setValue({
        username: '',
        firstname: '',
        lastname: '',
        user_type: 'Customer',
        password: '',
        confirmPassword: '',
      });
      expect(component.userForm.valid).toBeFalse();

      component.userForm.patchValue({
        username: 'user1',
        firstname: 'First',
        lastname: 'Last',
        password: 'password',
        confirmPassword: 'password',
      });
      expect(component.userForm.valid).toBeTrue();
    });

    it('should validate password and confirmPassword match', () => {
      component.userForm.patchValue({
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(component.userForm.errors).toBeNull();

      component.userForm.patchValue({
        password: 'password123',
        confirmPassword: 'password321',
      });
      expect(component.userForm.errors?.['passwordMismatch']).toBeTruthy(); // Updated
    });
  });

  describe('onSubmit', () => {
    it('should display an error message if the form is invalid', () => {
      component.userForm.setValue({
        username: '',
        firstname: '',
        lastname: '',
        user_type: 'Customer',
        password: '',
        confirmPassword: '',
      });
      component.onSubmit();

      expect(component.errorMessage).toBe('Please fill out all required fields.');
      expect(component.successMessage).toBe('');
    });

    it('should call addUser and display a success message on successful submission', () => {
      mockUserService.addUser.and.returnValue(
        of({
          id: 1,
          username: 'user1',
          firstname: 'First',
          lastname: 'Last',
          user_type: 'Customer',
          password: 'password123',
          created_at: '2025-01-25T00:00:00Z',
          disabled: false,
        })
      );

      component.userForm.setValue({
        username: 'user1',
        firstname: 'First',
        lastname: 'Last',
        user_type: 'Customer',
        password: 'password123',
        confirmPassword: 'password123',
      });

      component.onSubmit();

      expect(mockUserService.addUser).toHaveBeenCalledWith({
        username: 'user1',
        firstname: 'First',
        lastname: 'Last',
        user_type: 'Customer',
        password: 'password123',
      });

      expect(component.successMessage).toBe('User created successfully!');
      expect(component.errorMessage).toBe('');
    });


    it('should display an error message if addUser fails', () => {
      mockUserService.addUser.and.returnValue(throwError({ error: { message: 'Failed to create user.' } }));

      component.userForm.setValue({
        username: 'user1',
        firstname: 'First',
        lastname: 'Last',
        user_type: 'Customer',
        password: 'password123',
        confirmPassword: 'password123',
      });

      component.onSubmit();

      expect(mockUserService.addUser).toHaveBeenCalled();
      expect(component.errorMessage).toBe('Failed to create user.');
      expect(component.successMessage).toBe('');
    });
  });

  describe('User type behavior', () => {
    it('should set available user types based on user role', () => {
      localStorage.setItem('userType', 'Admin');
      component.ngOnInit();
      expect(component.availableUserTypes).toEqual(['Customer', 'Librarian', 'Admin']);

      localStorage.setItem('userType', 'Librarian');
      component.ngOnInit();
      expect(component.availableUserTypes).toEqual(['Customer', 'Librarian']);

      localStorage.setItem('userType', 'Customer');
      component.ngOnInit();
      expect(component.availableUserTypes).toEqual(['Customer']);
    });
  });
});
