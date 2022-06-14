import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqQaSidepanelSettingsComponent } from './faq-qa-sidepanel-settings.component';

describe('FaqQaSidepanelSettingsComponent', () => {
  let component: FaqQaSidepanelSettingsComponent;
  let fixture: ComponentFixture<FaqQaSidepanelSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FaqQaSidepanelSettingsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqQaSidepanelSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
