import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceEntryComponent } from './source-entry.component';

describe('SourceEntryComponent', () => {
  let component: SourceEntryComponent;
  let fixture: ComponentFixture<SourceEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SourceEntryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SourceEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
