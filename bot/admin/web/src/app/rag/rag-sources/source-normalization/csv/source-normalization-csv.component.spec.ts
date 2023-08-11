import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceNormalizationCsvComponent } from './source-normalization-csv.component';

describe('SourceNormalizationComponent', () => {
  let component: SourceNormalizationCsvComponent;
  let fixture: ComponentFixture<SourceNormalizationCsvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SourceNormalizationCsvComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SourceNormalizationCsvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
