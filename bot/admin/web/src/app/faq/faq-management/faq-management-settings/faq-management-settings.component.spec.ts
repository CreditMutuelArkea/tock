import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbIconModule,
  NbSelectModule,
  NbSpinnerModule,
  NbToastrService,
  NbTooltipModule
} from '@nebular/theme';
import { of } from 'rxjs';

import { BotService } from '../../../bot/bot-service';
import { DialogService } from '../../../core-nlp/dialog.service';
import { StateService } from '../../../core-nlp/state.service';
import { FormControlComponent } from '../../../shared/form-control/form-control.component';
import { TestSharedModule } from '../../../shared/test-shared.module';
import { FaqService } from '../../services/faq.service';
import { FaqManagementSettingsComponent } from './faq-management-settings.component';
import { StoryDefinitionConfigurationSummary } from '../../../bot/model/story';

const mockStories = [
  { _id: '1', name: 'story 1', category: 'category' } as StoryDefinitionConfigurationSummary,
  { _id: '2', name: 'story 2', category: 'category' } as StoryDefinitionConfigurationSummary,
  { _id: '3', name: 'story 3', category: 'faq' } as StoryDefinitionConfigurationSummary,
  { _id: '4', name: 'story 4', category: 'scenario' } as StoryDefinitionConfigurationSummary
];

const mockSettings = {
  satisfactionEnabled: true,
  satisfactionStoryId: '1'
};

class BotServiceMock {
  searchStories() {
    return of(mockStories);
  }
}

class FaqServiceMock {
  getSettings() {
    return of(mockSettings);
  }
}

class StateServiceMock {
  currentApplication = {
    namespace: 'namespace/test',
    name: 'test',
    _id: '1'
  };

  currentLocal = 'fr';
}

describe('FaqManagementSettingsComponent', () => {
  let component: FaqManagementSettingsComponent;
  let fixture: ComponentFixture<FaqManagementSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FaqManagementSettingsComponent, FormControlComponent],
      imports: [
        TestSharedModule,
        NbButtonModule,
        NbCardModule,
        NbCheckboxModule,
        NbIconModule,
        NbSelectModule,
        NbSpinnerModule,
        NbTooltipModule
      ],
      providers: [
        { provide: BotService, useClass: BotServiceMock },
        { provide: StateService, useClass: StateServiceMock },
        { provide: FaqService, useClass: FaqServiceMock },
        { provide: DialogService, useValue: {} },
        { provide: NbToastrService, useValue: {} }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqManagementSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize a form and update value with the api response', () => {
    expect(component.form.value).toEqual(mockSettings);
  });

  it('should initialize available stories and update value with api response without stories having "faq" category', () => {
    expect(component.availableStories).toHaveSize(3);

    component.availableStories.forEach((story) => {
      expect(story.category).not.toBe('faq');
    });
  });

  it('should associate validators to the satisfaction story id field and disable it when the satisfaction enabled field is true', () => {
    expect(component.form.value).toEqual(mockSettings);

    // set satisfactionEnabled to false
    component.satisfactionEnabled.setValue(false);
    expect(component.form.valid).toBeTruthy();
    expect(component.satisfactionStoryId.disabled).toBeTrue();
    expect(component.satisfactionStoryId.value).toBeFalsy();

    // set satisfactionEnabled to true
    component.satisfactionEnabled.setValue(true);
    expect(component.form.valid).toBeFalsy();
    expect(component.satisfactionStoryId.value).toBeFalsy();
    expect(component.satisfactionStoryId.enabled).toBeTrue();
    expect(component.satisfactionStoryId.errors.required).toBeTruthy();

    // set satisfactionId to something correct
    component.satisfactionEnabled.setValue(true);
    component.satisfactionStoryId.setValue(mockStories[0]._id);
    expect(component.form.valid).toBeTruthy();
    expect(component.satisfactionStoryId.value).toBe(mockStories[0]._id);
    expect(component.satisfactionStoryId.enabled).toBeTrue();
    expect(component.satisfactionStoryId.errors).toBeFalsy();
  });
});
