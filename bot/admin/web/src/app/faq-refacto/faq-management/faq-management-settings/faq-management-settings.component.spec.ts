import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqManagementSettingsComponent } from './faq-management-settings.component';

describe('FaqManagementSettingsComponent', () => {
  let component: FaqManagementSettingsComponent;
  let fixture: ComponentFixture<FaqManagementSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FaqManagementSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqManagementSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
