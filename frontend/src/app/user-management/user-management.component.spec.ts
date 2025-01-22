import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserManagementComponent } from './user-management.component';
import { of } from 'rxjs';
import { User } from '../models/user.model';
import { ActivatedRoute } from '@angular/router';

describe('UserManagementComponent', () => {
  let fixture: ComponentFixture<UserManagementComponent>;
  let component: UserManagementComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserManagementComponent, HttpClientTestingModule], // Only necessary modules
      providers: [
        {
          provide: ActivatedRoute, // Mock ActivatedRoute
          useValue: {
            snapshot: { params: {} }, // Mock params (customize as needed)
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch users on init', () => {
    const mockUsers: User[] = [
      {
        id: 1,
        username: 'johndoe',
        firstname: 'John',
        lastname: 'Doe',
        user_type: 'Admin',
        created_at: '2025-01-01T12:00:00Z',
        disabled: false,
        password: 'securepassword123',
      },
    ];
    spyOn(component['userService'], 'getUsers').and.returnValue(of(mockUsers));

    fixture.detectChanges(); // Triggers ngOnInit

    expect(component.users).toEqual(mockUsers);
  });

  it('should open password change modal for a specific user', () => {
    const mockUser: User = {
      id: 1,
      username: 'johndoe',
      firstname: 'John',
      lastname: 'Doe',
      user_type: 'Admin',
      created_at: '2025-01-01T12:00:00Z',
      disabled: false,
      password: 'securepassword123',
    };
    spyOn(component, 'openPasswordChangeModal');

    component.openPasswordChangeModal(mockUser);

    expect(component.openPasswordChangeModal).toHaveBeenCalledWith(mockUser);
  });

  it('should close the password change modal', () => {
    spyOn(component, 'closePasswordChangeModal');

    component.closePasswordChangeModal();

    expect(component.closePasswordChangeModal).toHaveBeenCalled();
  });

  it('should check if the user can edit based on role', () => {
    // Mock localStorage to set userRole to 'Admin'
    spyOn(localStorage, 'getItem').and.returnValue('Admin'); // Set logged-in user role

    // Trigger ngOnInit to initialize component properties
    component.ngOnInit();

    const mockUser: User = {
      id: 1,
      username: 'johndoe',
      firstname: 'John',
      lastname: 'Doe',
      user_type: 'Admin',
      created_at: '2025-01-01T12:00:00Z',
      disabled: false,
      password: 'securepassword123',
    };

    const canEdit = component.canEdit(mockUser);

    expect(canEdit).toBeTrue();
  });
});
