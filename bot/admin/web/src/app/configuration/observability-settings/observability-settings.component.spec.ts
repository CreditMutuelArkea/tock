import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservabilitySettingsComponent } from './observability-settings.component';
import { StateService } from '../../core-nlp/state.service';
import { RestService } from '../../core-nlp/rest/rest.service';
import { of } from 'rxjs';
import { NbToastrService, NbWindowService } from '@nebular/theme';
import { BotConfigurationService } from '../../core/bot-configuration.service';

describe('ObservabilitySettingsComponent', () => {
  let component: ObservabilitySettingsComponent;
  let fixture: ComponentFixture<ObservabilitySettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ObservabilitySettingsComponent],
      imports: [],
      providers: [
        {
          provide: NbToastrService,
          useValue: { show: () => {} }
        },
        {
          provide: NbWindowService,
          useValue: { open: () => {} }
        },
        {
          provide: StateService,
          useValue: {
            currentApplication: { namespace: 'namespace', name: 'app' }
          }
        },
        {
          provide: RestService,
          useValue: { get: () => of(), post: () => of({}) }
        },
        {
          provide: BotConfigurationService,
          useValue: { configurations: of([{}]) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ObservabilitySettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
