import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SentenceReviewRequestComponent } from './sentence-review-request.component';
import { NbDialogRef } from '@nebular/theme';

describe('SentenceReviewRequestComponent', () => {
  let component: SentenceReviewRequestComponent;
  let fixture: ComponentFixture<SentenceReviewRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SentenceReviewRequestComponent],
      imports: [NbDialogRef]
    }).compileComponents();

    fixture = TestBed.createComponent(SentenceReviewRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
