import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceNormalizationJsonComponent } from './source-normalization-json.component';

describe('SourceNormalizationJsonComponent', () => {
  let component: SourceNormalizationJsonComponent;
  let fixture: ComponentFixture<SourceNormalizationJsonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SourceNormalizationJsonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SourceNormalizationJsonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
