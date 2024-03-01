import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { GeneratedSentenceError } from '../../models';

type State = {
  sentencesExample: string[];
  errors: GeneratedSentenceError[];
};

@Injectable({
  providedIn: 'root'
})
export class SentencesGenerationService {
  private _state: BehaviorSubject<State>;
  state$: Observable<State>;

  constructor() {
    this._state = new BehaviorSubject({ sentencesExample: [], errors: [] });
    this.state$ = this._state.asObservable();
  }

  feedSentencesExample(sentencesExample: string[]): void {
    this._state.next({ ...this._state.getValue(), sentencesExample });
  }

  resetSentencesExample(): void {
    this._state.next({ ...this._state.getValue(), sentencesExample: [] });
  }

  feedErrors(errors: GeneratedSentenceError[]): void {
    this._state.next({ ...this._state.getValue(), errors });
  }

  resetErrors(): void {
    this._state.next({ ...this._state.getValue(), errors: [] });
  }
}
