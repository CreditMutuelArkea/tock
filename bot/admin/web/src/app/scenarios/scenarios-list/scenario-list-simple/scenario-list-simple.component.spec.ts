import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ScenarioListSimpleComponent } from './scenario-list-simple.component';
import { StateService } from '../../../core-nlp/state.service';
import { TestSharedModule } from '../../../shared/test-shared.module';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

describe('ScenarioListSimpleComponent', () => {
  let component: ScenarioListSimpleComponent;
  let fixture: ComponentFixture<ScenarioListSimpleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScenarioListSimpleComponent],
      providers: [
        {
          provide: StateService,
          useValue: { currentApplication: { name: 'TestApplicationName' } }
        },
        { provide: DatePipe },
        { provide: Router, useValue: {} }
      ],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [TestSharedModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScenarioListSimpleComponent);
    component = fixture.componentInstance;
    component.sagas = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
