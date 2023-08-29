import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RagExcludedComponent } from './rag-excluded.component';

describe('RagExcludedComponent', () => {
  let component: RagExcludedComponent;
  let fixture: ComponentFixture<RagExcludedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RagExcludedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RagExcludedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
