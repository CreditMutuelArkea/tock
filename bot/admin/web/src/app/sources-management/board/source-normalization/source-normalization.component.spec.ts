import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceNormalizationComponent } from './source-normalization.component';

describe('SourceNormalizationComponent', () => {
  let component: SourceNormalizationComponent;
  let fixture: ComponentFixture<SourceNormalizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SourceNormalizationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SourceNormalizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
