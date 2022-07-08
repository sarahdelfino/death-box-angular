import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileHighLowComponent } from './mobile-high-low.component';

describe('MobileHighLowComponent', () => {
  let component: MobileHighLowComponent;
  let fixture: ComponentFixture<MobileHighLowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MobileHighLowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileHighLowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
