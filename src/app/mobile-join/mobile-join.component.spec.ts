import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileJoinComponent } from './mobile-join.component';

describe('MobileJoinComponent', () => {
  let component: MobileJoinComponent;
  let fixture: ComponentFixture<MobileJoinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MobileJoinComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileJoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
