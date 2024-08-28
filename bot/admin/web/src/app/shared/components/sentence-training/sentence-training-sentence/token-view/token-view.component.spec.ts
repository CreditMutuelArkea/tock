import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenViewComponent } from './token-view.component';
import { StateService } from '../../../../../core-nlp/state.service';
import { Token } from './token.model';

class StateServiceMock {
  user = { organisation: 'testOrg' };
}

describe('TokenViewComponent', () => {
  let component: TokenViewComponent;
  let fixture: ComponentFixture<TokenViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TokenViewComponent],
      providers: [
        {
          provide: StateService,
          useClass: StateServiceMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TokenViewComponent);
    component = fixture.componentInstance;
    component.token = {
      color: () => {
        return '#ff6600';
      }
    } as Token;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
