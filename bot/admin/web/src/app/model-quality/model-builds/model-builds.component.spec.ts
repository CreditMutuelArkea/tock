import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelBuildsComponent } from './model-builds.component';
import { StateService } from '../../core-nlp/state.service';
import { Subject } from 'rxjs';
import { EntityType, Intent } from '../../model/nlp';
import { ApplicationService } from '../../core-nlp/applications.service';

class StateServiceMock {
  currentApplication = { namespace: 'namespace', name: 'app' };
  configurationChange: Subject<boolean> = new Subject();
  findIntentById(): Intent {
    return {
      name: 'intentAssociate'
    } as Intent;
  }
  findEntityTypeByName(): EntityType {
    return {
      name: 'intentAssociate'
    } as EntityType;
  }
}

class ApplicationServiceMock {
  builds() {
    return new Subject();
  }
}

describe('ModelBuildsComponent', () => {
  let component: ModelBuildsComponent;
  let fixture: ComponentFixture<ModelBuildsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModelBuildsComponent],
      providers: [
        {
          provide: StateService,
          useClass: StateServiceMock
        },
        {
          provide: ApplicationService,
          useClass: ApplicationServiceMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModelBuildsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
