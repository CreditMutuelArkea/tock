import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourcesProcessingComponent } from './sources-processing.component';

describe('SourcesProcessingComponent', () => {
  let component: SourcesProcessingComponent;
  let fixture: ComponentFixture<SourcesProcessingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SourcesProcessingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SourcesProcessingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
