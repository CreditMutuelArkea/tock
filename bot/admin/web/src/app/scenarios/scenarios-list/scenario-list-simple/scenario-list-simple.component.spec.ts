import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ScenarioListSimpleComponent } from './scenario-list-simple.component';
import { OrderByPipe } from '../../../shared/pipes/orderBy.pipe';

describe('ScenarioListSimpleComponent', () => {
  let component: ScenarioListSimpleComponent;
  let fixture: ComponentFixture<ScenarioListSimpleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScenarioListSimpleComponent, OrderByPipe],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScenarioListSimpleComponent);
    component = fixture.componentInstance;
    component.scenarios = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
