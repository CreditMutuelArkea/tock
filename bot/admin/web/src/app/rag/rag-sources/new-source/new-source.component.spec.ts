import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NbDialogRef } from '@nebular/theme';

import { NewSourceComponent } from './new-source.component';

describe('NewSourceComponent', () => {
  let component: NewSourceComponent;
  let fixture: ComponentFixture<NewSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewSourceComponent],
      providers: [{ provide: NbDialogRef, useValue: { close: () => {} } }]
    }).compileComponents();

    fixture = TestBed.createComponent(NewSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
