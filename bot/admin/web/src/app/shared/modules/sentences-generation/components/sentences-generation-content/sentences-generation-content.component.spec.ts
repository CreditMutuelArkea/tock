import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SentencesGenerationContentComponent } from './sentences-generation-content.component';

describe('SentencesGenerationComponent', () => {
  let component: SentencesGenerationContentComponent;
  let fixture: ComponentFixture<SentencesGenerationContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SentencesGenerationContentComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SentencesGenerationContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
