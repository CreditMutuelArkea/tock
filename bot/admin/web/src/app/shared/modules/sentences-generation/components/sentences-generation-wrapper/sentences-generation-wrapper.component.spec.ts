import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SentencesGenerationWrapperComponent } from './sentences-generation-wrapper.component';

describe('SentencesGenerationWrapperComponent', () => {
  let component: SentencesGenerationWrapperComponent;
  let fixture: ComponentFixture<SentencesGenerationWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SentencesGenerationWrapperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SentencesGenerationWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
