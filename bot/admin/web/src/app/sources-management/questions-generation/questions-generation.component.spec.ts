import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionsGenerationComponent } from './questions-generation.component';

describe('QuestionsGenerationComponent', () => {
  let component: QuestionsGenerationComponent;
  let fixture: ComponentFixture<QuestionsGenerationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionsGenerationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionsGenerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
