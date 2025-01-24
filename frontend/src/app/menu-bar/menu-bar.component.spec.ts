import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MenuBarComponent } from './menu-bar.component';
import { LogoutService } from '../services/logout.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('MenuBarComponent', () => {
  let logoutServiceSpy: jasmine.SpyObj<LogoutService>;

  beforeEach(async () => {
    logoutServiceSpy = jasmine.createSpyObj('LogoutService', ['logout']);

    await TestBed.configureTestingModule({
      imports: [
        MenuBarComponent, // Import the standalone component
        RouterTestingModule, // For Router functionality
        HttpClientTestingModule, // For HttpClient in LogoutService
      ],
      providers: [{ provide: LogoutService, useValue: logoutServiceSpy }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MenuBarComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should call logout and navigate to login', async () => {
    const fixture = TestBed.createComponent(MenuBarComponent);
    const component = fixture.componentInstance;

    // Mock router navigation to return a resolved Promise
    const routerSpy = spyOn(component['router'], 'navigate').and.returnValue(Promise.resolve(true));

    // Mock the logoutService to return an Observable<void>
    logoutServiceSpy.logout.and.returnValue(of(undefined)); // Simulate a successful logout

    component.logout(); // Call the logout method

    // Ensure Angular change detection happens after logout
    fixture.detectChanges();

    // Wait for async operations to complete
    await fixture.whenStable();

    // Check if the logout method and router navigation were called
    expect(logoutServiceSpy.logout).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should display user information', () => {
    // Simulate user info in localStorage BEFORE creating the component
    localStorage.setItem('firstname', 'John');
    localStorage.setItem('lastname', 'Doe');
    localStorage.setItem('userType', 'Admin');

    const fixture = TestBed.createComponent(MenuBarComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges(); // Trigger change detection

    // Check if the displayed values match the localStorage data
    expect(component.firstname).toBe('John');
    expect(component.lastname).toBe('Doe');
    expect(component.userType).toBe('Admin');
  });

});
