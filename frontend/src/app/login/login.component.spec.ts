import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginComponent } from './login.component';
import { Router } from '@angular/router';
import { of } from 'rxjs/internal/observable/of';
import { throwError } from 'rxjs';


describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpTestingController: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule, // For mocking HTTP requests
        RouterTestingModule.withRoutes([]), // For router-related testing
        LoginComponent, // Standalone component
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify(); // Ensure no pending HTTP requests
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should create the LoginComponent', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should call onSubmit and perform login', () => {
    const loginData = { username: 'testUser', password: 'testPass' };
    const loginResponse = {
      token: 'mockToken',
      userId: 1,
      username: 'testUser',
      firstname: 'John',
      lastname: 'Doe',
      userType: 'admin',
      borrowedItems: [],
    };

    // Mock the HTTP request
    spyOn(component['http'], 'post').and.returnValue(of(loginResponse));
    spyOn(component['router'], 'navigate').and.returnValue(Promise.resolve(true));

    component.username = loginData.username;
    component.password = loginData.password;
    component.onSubmit();

    expect(component['http'].post).toHaveBeenCalledWith(
      `${component.baseUrl}/api/login`,
      loginData
    );
    expect(component['router'].navigate).toHaveBeenCalledWith(['/library-list']);
    expect(localStorage.getItem('token')).toBe('mockToken');
  });

  it('should handle login errors', () => {
    const loginData = { username: 'testUser', password: 'wrongPass' };

    // Mock the HTTP request to fail
    spyOn(component['http'], 'post').and.returnValue(throwError('Invalid credentials'));
    spyOn(component['router'], 'navigate').and.returnValue(Promise.resolve(true));

    component.username = loginData.username;
    component.password = loginData.password;
    component.onSubmit();

    expect(component.errorMessage).toBe('Invalid username or password');
  });

  it('should store user data in localStorage after successful login', () => {
    const loginResponse = {
      token: 'mockToken',
      userId: 1,
      username: 'testUser',
      firstname: 'John',
      lastname: 'Doe',
      userType: 'Admin',
      borrowedItems: [],
    };

    spyOn(component['http'], 'post').and.returnValue(of(loginResponse));
    spyOn(localStorage, 'setItem');

    component.username = 'testUser';
    component.password = 'testPass';
    component.onSubmit();

    // Expect localStorage to be called with correct stringified values
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mockToken');
    expect(localStorage.setItem).toHaveBeenCalledWith('userId', loginResponse.userId.toString());
    expect(localStorage.setItem).toHaveBeenCalledWith('username', 'testUser');
    expect(localStorage.setItem).toHaveBeenCalledWith('firstname', 'John');
    expect(localStorage.setItem).toHaveBeenCalledWith('lastname', 'Doe');
    expect(localStorage.setItem).toHaveBeenCalledWith('userType', 'Admin');
    expect(localStorage.setItem).toHaveBeenCalledWith('borrowedItems', JSON.stringify(loginResponse.borrowedItems));
  });

  it('should display error message on login failure', async () => {
    const loginData = { username: 'testUser', password: 'wrongPass' };

    // Mock the HTTP post to return an error
    spyOn(component['http'], 'post').and.returnValue(throwError(() => new Error('Invalid credentials')));
    spyOn(component['router'], 'navigate').and.returnValue(Promise.resolve(true));

    component.username = loginData.username;
    component.password = loginData.password;

    // Trigger the login method
    component.onSubmit();

    // Wait for asynchronous tasks to complete
    await fixture.whenStable();

    // Trigger change detection to update the DOM
    fixture.detectChanges();

    // Find the error message element
    const errorMessage = fixture.nativeElement.querySelector('.error');

    // Assert that the error message is displayed
    expect(errorMessage).toBeTruthy(); // Ensure the element exists
    expect(errorMessage.textContent).toContain('Invalid username or password');
  });

  it('should initialize form fields', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    expect(component.username).toBe('');
    expect(component.password).toBe('');
    expect(component.errorMessage).toBe('');
  });

});
