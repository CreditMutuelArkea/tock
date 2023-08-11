import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonIteratorComponent } from './json-iterator.component';

describe('JsonIteratorComponent', () => {
  let component: JsonIteratorComponent;
  let fixture: ComponentFixture<JsonIteratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JsonIteratorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JsonIteratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
