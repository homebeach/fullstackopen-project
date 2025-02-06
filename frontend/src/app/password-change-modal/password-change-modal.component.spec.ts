import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordChangeModalComponent } from './password-change-modal.component';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('PasswordChangeModalComponent', () => {
  let component: PasswordChangeModalComponent;
  let fixture: ComponentFixture<PasswordChangeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordChangeModalComponent, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordChangeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger initial data binding
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit close event when onClose is called', () => {
    spyOn(component.close, 'emit');

    const cancelButton = fixture.debugElement.query(By.css('button')).nativeElement;
    cancelButton.click();

    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should show an error if passwords do not match', () => {
    component.newPassword = 'password123';
    component.confirmPassword = 'differentPassword';
    component.onSubmit();

    fixture.detectChanges();
    const errorMessageElement = fixture.debugElement.query(By.css('.error-message')).nativeElement;

    expect(component.errorMessage).toBe('Passwords do not match.');
    expect(errorMessageElement.textContent.trim()).toBe('Passwords do not match.'); // Trim whitespace
  });

  it('should show an error if password is less than 8 characters', () => {
    component.newPassword = 'short';
    component.confirmPassword = 'short';
    component.onSubmit();

    fixture.detectChanges();
    const errorMessageElement = fixture.debugElement.query(By.css('.error-message')).nativeElement;

    expect(component.errorMessage).toBe('Password must be at least 8 characters long.');
    expect(errorMessageElement.textContent.trim()).toBe('Password must be at least 8 characters long.'); // Trim whitespace
  });

  it('should emit submit event with valid passwords', () => {
    spyOn(component.submit, 'emit');

    component.newPassword = 'password123';
    component.confirmPassword = 'password123';

    const submitButton = fixture.debugElement.queryAll(By.css('button'))[1].nativeElement;
    submitButton.click();

    expect(component.submit.emit).toHaveBeenCalledWith({
      newPassword: 'password123',
      confirmPassword: 'password123',
    });
  });

  it('should clear errorMessage and emit close after valid submission', () => {
    spyOn(component.close, 'emit');
    component.newPassword = 'password123';
    component.confirmPassword = 'password123';

    component.onSubmit();

    expect(component.errorMessage).toBe('');
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should bind inputs to the respective properties', () => {
    const newPasswordInput = fixture.debugElement.query(By.css('#newPassword')).nativeElement;
    const confirmPasswordInput = fixture.debugElement.query(By.css('#confirmPassword')).nativeElement;

    newPasswordInput.value = 'password123';
    newPasswordInput.dispatchEvent(new Event('input'));

    confirmPasswordInput.value = 'password123';
    confirmPasswordInput.dispatchEvent(new Event('input'));

    expect(component.newPassword).toBe('password123');
    expect(component.confirmPassword).toBe('password123');
  });
});
