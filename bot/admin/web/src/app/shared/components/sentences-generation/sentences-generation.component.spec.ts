import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SentencesGenerationComponent } from './sentences-generation.component';
import { NbDialogRef } from '@nebular/theme';
import { StateService } from '../../../core-nlp/state.service';
import { RestService } from '../../../core-nlp/rest/rest.service';
import { of } from 'rxjs';

describe('SentencesGenerationComponent', () => {
  let component: SentencesGenerationComponent;
  let fixture: ComponentFixture<SentencesGenerationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SentencesGenerationComponent],
      providers: [
        {
          provide: NbDialogRef,
          useValue: {}
        },
        {
          provide: StateService,
          useValue: { currentApplication: { name: 'TestApp', namespace: 'TestNamespace' }, currentLocale: 'fr' }
        },
        {
          provide: RestService,
          useValue: { get: () => of() }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SentencesGenerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
