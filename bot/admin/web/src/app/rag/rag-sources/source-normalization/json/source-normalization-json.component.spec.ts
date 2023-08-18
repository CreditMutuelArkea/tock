import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NbDialogRef } from '@nebular/theme';
import { ProcessAdvancement, Source, SourceTypes } from '../../models';

import { SourceNormalizationJsonComponent } from './source-normalization-json.component';

const sourceMock = {
  id: '654',
  enabled: false,
  name: 'Other kind of json source format',
  description: '',
  source_type: SourceTypes.file,
  status: ProcessAdvancement.complete,
  source_parameters: {
    file_format: 'json'
  },
  rawData: []
};
describe('SourceNormalizationJsonComponent', () => {
  let component: SourceNormalizationJsonComponent;
  let fixture: ComponentFixture<SourceNormalizationJsonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SourceNormalizationJsonComponent],
      providers: [{ provide: NbDialogRef, useValue: { close: () => {} } }]
    }).compileComponents();

    fixture = TestBed.createComponent(SourceNormalizationJsonComponent);
    component = fixture.componentInstance;
    component.source = sourceMock as Source;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
