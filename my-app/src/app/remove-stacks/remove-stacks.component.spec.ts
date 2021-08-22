import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveStacksComponent } from './remove-stacks.component';

describe('RemoveStacksComponent', () => {
  let component: RemoveStacksComponent;
  let fixture: ComponentFixture<RemoveStacksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RemoveStacksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveStacksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
