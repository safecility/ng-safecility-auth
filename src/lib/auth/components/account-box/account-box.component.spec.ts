import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountBoxComponent } from './account-box.component';

describe('AccountBoxComponent', () => {
  let component: AccountBoxComponent;
  let fixture: ComponentFixture<AccountBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
