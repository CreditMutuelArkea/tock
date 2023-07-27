import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BotService } from '../../bot/bot-service';
import { StateService } from '../../core-nlp/state.service';

import { RagSettingsComponent } from './rag-settings.component';

describe('RagSettingsComponent', () => {
  let component: RagSettingsComponent;
  let fixture: ComponentFixture<RagSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RagSettingsComponent],
      providers: [
        {
          provide: BotService,
          useValue: {
            searchStories: () => of([])
          }
        },
        {
          provide: StateService,
          useValue: {
            currentLocale: 'fr',
            currentApplication: {
              namespace: 'testNamespace',
              name: 'testName'
            }
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RagSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
