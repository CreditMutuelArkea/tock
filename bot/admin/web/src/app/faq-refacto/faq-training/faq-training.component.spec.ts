import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqTrainingComponent } from './faq-training.component';

describe('FaqTrainingComponent', () => {
  let component: FaqTrainingComponent;
  let fixture: ComponentFixture<FaqTrainingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FaqTrainingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqTrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
