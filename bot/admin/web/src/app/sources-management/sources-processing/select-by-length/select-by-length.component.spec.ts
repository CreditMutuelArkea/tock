import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectByLengthComponent } from './select-by-length.component';

describe('SelectByLengthComponent', () => {
  let component: SelectByLengthComponent;
  let fixture: ComponentFixture<SelectByLengthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectByLengthComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectByLengthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
