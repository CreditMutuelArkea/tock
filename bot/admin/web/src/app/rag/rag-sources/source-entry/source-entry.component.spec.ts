import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NbDialogService } from '@nebular/theme';
import { ProcessAdvancement, Source, SourceTypes } from '../models';

import { SourceEntryComponent } from './source-entry.component';

const sourceMock = {
  id: '654',
  enabled: false,
  name: 'Other kind of json source format',
  description: '',
  source_type: SourceTypes.file,
  status: ProcessAdvancement.complete,
  source_parameters: {
    file_format: 'json'
  }
};

describe('SourceEntryComponent', () => {
  let component: SourceEntryComponent;
  let fixture: ComponentFixture<SourceEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SourceEntryComponent],
      providers: [{ provide: NbDialogService, useValue: { open: () => {} } }]
    }).compileComponents();

    fixture = TestBed.createComponent(SourceEntryComponent);
    component = fixture.componentInstance;
    component.source = sourceMock as Source;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
