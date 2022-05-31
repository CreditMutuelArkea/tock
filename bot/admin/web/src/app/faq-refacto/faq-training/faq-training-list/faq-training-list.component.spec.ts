import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqTrainingListComponent } from './faq-training-list.component';

describe('FaqTrainingListComponent', () => {
  let component: FaqTrainingListComponent;
  let fixture: ComponentFixture<FaqTrainingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FaqTrainingListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqTrainingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
