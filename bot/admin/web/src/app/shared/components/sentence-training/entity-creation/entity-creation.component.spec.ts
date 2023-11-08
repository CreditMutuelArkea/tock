import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityCreationComponent } from './entity-creation.component';

describe('EntityCreationComponent', () => {
  let component: EntityCreationComponent;
  let fixture: ComponentFixture<EntityCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityCreationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntityCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
