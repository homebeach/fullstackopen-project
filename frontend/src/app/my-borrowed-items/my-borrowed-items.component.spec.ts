import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyBorrowedItemsComponent } from './my-borrowed-items.component';

describe('MyBorrowedItemsComponent', () => {
  let component: MyBorrowedItemsComponent;
  let fixture: ComponentFixture<MyBorrowedItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyBorrowedItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyBorrowedItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
