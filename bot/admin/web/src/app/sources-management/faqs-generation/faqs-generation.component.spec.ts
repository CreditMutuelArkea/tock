import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqsGenerationComponent } from './faqs-generation.component';

describe('FaqsGenerationComponent', () => {
  let component: FaqsGenerationComponent;
  let fixture: ComponentFixture<FaqsGenerationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FaqsGenerationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqsGenerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
