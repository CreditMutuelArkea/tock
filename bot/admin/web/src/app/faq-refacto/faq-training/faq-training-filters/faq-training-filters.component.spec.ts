import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqTrainingFiltersComponent } from './faq-training-filters.component';

describe('FaqTrainingFiltersComponent', () => {
  let component: FaqTrainingFiltersComponent;
  let fixture: ComponentFixture<FaqTrainingFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FaqTrainingFiltersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqTrainingFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
