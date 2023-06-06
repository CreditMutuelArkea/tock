import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextsGraphModalComponent } from './contexts-graph-modal.component';

describe('ContextsGraphModalComponent', () => {
  let component: ContextsGraphModalComponent;
  let fixture: ComponentFixture<ContextsGraphModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContextsGraphModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContextsGraphModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
