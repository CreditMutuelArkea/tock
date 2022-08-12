import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';
import {
  NbAutocompleteModule,
  NbBadgeModule,
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbFormFieldModule,
  NbIconModule,
  NbSelectModule,
  NbSpinnerModule,
  NbTabsetModule,
  NbTagModule,
  NbTooltipModule
} from '@nebular/theme';

import { DialogService } from '../../../core-nlp/dialog.service';
import { NlpService } from '../../../nlp-tabs/nlp.service';
import { StateService } from '../../../core-nlp/state.service';
import { TestSharedModule } from '../../../shared/test-shared.module';
import { FaqManagementEditComponent, FaqTabs } from './faq-management-edit.component';
import { FormControlComponent } from '../../../shared/form-control/form-control.component';
import { FaqDefinitionExtended } from '../faq-management.component';

const faq: FaqDefinitionExtended = {
  id: '1',
  applicationId: '1',
  enabled: true,
  language: 'fr',
  title: 'title',
  description: 'description',
  tags: ['tag 1'],
  utterances: ['question 1', 'question 2'],
  answer: 'answer'
};

describe('FaqManagementEditComponent', () => {
  let component: FaqManagementEditComponent;
  let fixture: ComponentFixture<FaqManagementEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FaqManagementEditComponent, FormControlComponent],
      imports: [
        TestSharedModule,
        NbAutocompleteModule,
        NbTabsetModule,
        NbTagModule,
        NbSpinnerModule,
        NbBadgeModule,
        NbCheckboxModule,
        NbIconModule,
        NbFormFieldModule,
        NbSelectModule,
        NbCardModule,
        NbButtonModule,
        NbTooltipModule
      ],
      providers: [
        { provide: StateService, useValue: {} },
        { provide: DialogService, useValue: {} },
        { provide: NlpService, useValue: {} }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqManagementEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('new faq', () => {
    it('should initialize the current tab on the info part', () => {
      const nameElement = fixture.debugElement.query(By.css('[name="name"]'));
      const descriptionElement = fixture.debugElement.query(By.css('[name="description"]'));
      const tagsElement = fixture.debugElement.query(By.css('[name="tags"]'));
      const utterrancesElement = fixture.debugElement.query(By.css('[name="question"]'));
      const answerElement = fixture.debugElement.query(By.css('[name="anwser"]'));

      expect(component.currentTab).toBe(FaqTabs.INFO);
      expect(nameElement).toBeTruthy();
      expect(descriptionElement).toBeTruthy();
      expect(tagsElement).toBeTruthy();
      expect(utterrancesElement).toBeFalsy();
      expect(answerElement).toBeFalsy();
    });

    it('should initialize an empty form', () => {
      expect(component.form.valid).toBeFalse();
      expect(component.form.value).toEqual({
        title: null,
        description: '',
        tags: [],
        utterances: [],
        answer: ''
      });
    });
  });

  describe('edit faq', () => {
    it('should initialize the current tab on the info part', () => {
      component.ngOnChanges({ faq: new SimpleChange(null, faq, true) });
      fixture.detectChanges();
      const nameElement = fixture.debugElement.query(By.css('[name="name"]'));
      const descriptionElement = fixture.debugElement.query(By.css('[name="description"]'));
      const tagsElement = fixture.debugElement.query(By.css('[name="tags"]'));
      const utterrancesElement = fixture.debugElement.query(By.css('[name="question"]'));
      const answerElement = fixture.debugElement.query(By.css('[name="anwser"]'));

      expect(component.currentTab).toBe(FaqTabs.INFO);
      expect(nameElement).toBeTruthy();
      expect(descriptionElement).toBeTruthy();
      expect(tagsElement).toBeTruthy();
      expect(utterrancesElement).toBeFalsy();
      expect(answerElement).toBeFalsy();
    });

    it('should initialize a form with the correct value', () => {
      component.ngOnChanges({ faq: new SimpleChange(null, faq, true) });
      fixture.detectChanges();
      expect(component.form.valid).toBeFalse();
      expect(component.form.value).toEqual({
        title: 'title',
        description: 'description',
        tags: ['tag 1'],
        utterances: ['question 1', 'question 2'],
        answer: 'answer'
      });
    });
  });

  it('should associate validators to the title', () => {
    expect(component.title.valid).toBeFalse();

    // title field is required
    expect(component.title.errors.required).toBeTrue();
    expect(component.title.errors.maxlength).toBeFalsy();
    expect(component.title.errors.minlength).toBeFalsy();
    expect(component.title.valid).toBeFalse();

    // set title to short text (less than 6 characters)
    component.title.setValue('test');
    expect(component.title.errors.required).toBeFalsy();
    expect(component.title.errors.maxlength).toBeFalsy();
    expect(component.title.errors.minlength).toBeTruthy();
    expect(component.title.errors.minlength.requiredLength).toBe(6);
    expect(component.title.valid).toBeFalse();

    // set title to long text (upper than 40 characters)
    component.title.setValue('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    expect(component.title.errors.required).toBeFalsy();
    expect(component.title.errors.minlength).toBeFalsy();
    expect(component.title.errors.maxlength).toBeTruthy();
    expect(component.title.errors.maxlength.requiredLength).toBe(40);
    expect(component.title.valid).toBeFalse();

    // set title to something correct
    component.title.setValue('correct value');
    expect(component.title.errors).toBeFalsy();
    expect(component.title.valid).toBeTrue();
  });

  it('should associate validators to the description', () => {
    expect(component.description.valid).toBeTrue();

    // set description to long text (upper than 500 characters)
    component.description.setValue(
      'llllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll'
    );
    expect(component.description.errors.maxlength).toBeTruthy();
    expect(component.description.valid).toBeFalse();
    expect(component.description.errors.maxlength.requiredLength).toBe(component.controlsMaxLength.description);

    // set description to something correct
    component.description.setValue('correct value');
    expect(component.description.errors).toBeFalsy();
    expect(component.description.valid).toBeTrue();
  });

  it('should associate validators to the utterances', () => {
    expect(component.utterances.valid).toBeFalse();

    // utterances is required
    expect(component.utterances.errors.required).toBeTruthy();

    // set utterances to something correct
    component.utterances.push(new FormControl('test'));
    expect(component.utterances.errors).toBeFalsy();
    expect(component.utterances.valid).toBeTrue();
  });

  it('should associate validators to the answer', () => {
    expect(component.answer.valid).toBeFalse();

    // answer is required
    expect(component.answer.errors.required).toBeTruthy();
    expect(component.answer.errors.maxlength).toBeFalsy();

    // set answer to long text (upper than 960)
    component.answer.setValue(
      'llllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll'
    );
    expect(component.answer.errors.required).toBeFalsy();
    expect(component.answer.errors.maxlength).toBeTruthy();
    expect(component.answer.errors.maxlength.requiredLength).toBe(component.controlsMaxLength.answer);

    // set answer to something correct
    component.answer.setValue('correct value');
    expect(component.answer.errors).toBeFalsy();
    expect(component.answer.valid).toBeTrue();
  });

  it('should reset alert for utterance when the method is called', () => {
    component.existingUterranceInOtherintent = 'utterance';
    component.intentNameExistInApp = true;

    component.resetAlerts();

    expect(component.existingUterranceInOtherintent).toBeUndefined();
    expect(component.intentNameExistInApp).toBeUndefined();
  });
});
