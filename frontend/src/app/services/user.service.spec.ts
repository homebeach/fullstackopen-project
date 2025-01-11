import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService, User } from './user.service';
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
        },
        {
          id: 2,
          username: 'janedoe',
          firstname: 'Jane',
          lastname: 'Doe',
          user_type: 'Customer',
          created_at: '2023-01-02T00:00:00Z',
        },
      ];

      // Call the service method
      service.getUsers().subscribe((users) => {
        expect(users).toEqual(mockUsers);
      });

      // Mock the HTTP request
      const req = httpTestingController.expectOne(mockApiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers); // Return mock data
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
      };

      const userId = 1;

      // Call the service method
      service.getUserById(userId).subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      // Mock the HTTP request
      const req = httpTestingController.expectOne(`${mockApiUrl}/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser); // Return mock data
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
      };

      // Call the service method
      service.addUser(newUser).subscribe((user) => {
        expect(user).toEqual(createdUser);
      });

      // Mock the HTTP request
      const req = httpTestingController.expectOne(mockApiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newUser);
      req.flush(createdUser); // Return mock data
    });
  });

  describe('#updateUser', () => {
    it('should update an existing user', () => {
      const username = 'johndoe';
      const updates = {
        newPassword: 'newpassword123',
        firstname: 'UpdatedJohn',
      };

      const mockResponse = {
        message: 'Password updated, First name updated',
        user: { username: 'johndoe' },
      };

      // Call the service method
      service.updateUser(username, updates).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      // Mock the HTTP request
      const req = httpTestingController.expectOne(`${mockApiUrl}/${username}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updates);
      req.flush(mockResponse); // Return mock data
    });
  });
});
