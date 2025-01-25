import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { MainLayoutComponent } from './main-layout.component';
import { MenuBarComponent } from '../menu-bar/menu-bar.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule, // Import for routing support
        HttpClientModule, // Import HttpClientModule to provide HttpClient
        MainLayoutComponent, // Import the standalone MainLayoutComponent
        MenuBarComponent, // Import the standalone MenuBarComponent (if it's standalone)
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
