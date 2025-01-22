import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

describe('UserService', () => {
  let service: UserService;
  let httpTestingController: HttpTestingController;

  const mockApiUrl = `${environment.apiBaseUrl}/api/users`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });

    service = TestBed.inject(UserService);
    httpTestingController = TestBed.inject(HttpTestingController);

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'token') return 'mockToken';
      return null;
    });
  });

  afterEach(() => {
    httpTestingController.verify(); // Ensure no outstanding HTTP requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getUsers', () => {
    it('should fetch a list of users', () => {
      const mockUsers: User[] = [
        {
          id: 1,
          username: 'johndoe',
          firstname: 'John',
          lastname: 'Doe',
          user_type: 'Admin',
          created_at: '2023-01-01T00:00:00Z',
          disabled: false,
          password: '',
        },
        {
          id: 2,
          username: 'janedoe',
          firstname: 'Jane',
          lastname: 'Doe',
          user_type: 'Customer',
          created_at: '2023-01-02T00:00:00Z',
          disabled: false,
          password: '',
        },
      ];

      service.getUsers().subscribe((users) => {
        expect(users).toEqual(mockUsers);
      });

      const req = httpTestingController.expectOne(mockApiUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer mockToken');
      req.flush(mockUsers);
    });
  });

  describe('#getUserById', () => {
    it('should fetch a user by ID', () => {
      const mockUser: User = {
        id: 1,
        username: 'johndoe',
        firstname: 'John',
        lastname: 'Doe',
        user_type: 'Admin',
        created_at: '2023-01-01T00:00:00Z',
        disabled: false,
        password: '',
      };

      service.getUserById(1).subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpTestingController.expectOne(`${mockApiUrl}/1`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer mockToken');
      req.flush(mockUser);
    });
  });

  describe('#addUser', () => {
    it('should create a new user', () => {
      const newUser = {
        username: 'newuser',
        firstname: 'New',
        lastname: 'User',
        user_type: 'Customer',
        password: 'password123',
      };

      const createdUser: User = {
        id: 3,
        username: 'newuser',
        firstname: 'New',
        lastname: 'User',
        user_type: 'Customer',
        created_at: '2023-01-03T00:00:00Z',
        disabled: false,
        password: '',
      };

      service.addUser(newUser).subscribe((user) => {
        expect(user).toEqual(createdUser);
      });

      const req = httpTestingController.expectOne(mockApiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe('Bearer mockToken');
      expect(req.request.body).toEqual(newUser);
      req.flush(createdUser);
    });
  });

  describe('#updateUser', () => {
    it('should update an existing user', () => {
      const updates = {
        newPassword: 'newpassword123',
        firstname: 'UpdatedJohn',
      };

      const mockResponse = {
        message: 'Password updated, First name updated',
        user: { id: 1, username: 'johndoe' },
      };

      service.updateUser(1, updates).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpTestingController.expectOne(`${mockApiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('Authorization')).toBe('Bearer mockToken');
      expect(req.request.body).toEqual({
        ...updates,
        password: updates.newPassword,
      });
      req.flush(mockResponse);
    });
  });
});
