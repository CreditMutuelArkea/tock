import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SentencesGenerationService {
  private _sentencesExample: BehaviorSubject<string[]>;
  sentencesExample$: Observable<string[]>;

  constructor() {
    this._sentencesExample = new BehaviorSubject([]);
    this.sentencesExample$ = this._sentencesExample.asObservable();
  }

  feedSentencesExample(sentencesExample: string[]): void {
    this._sentencesExample.next(sentencesExample);
  }

  reset(): void {
    this._sentencesExample.next([]);
  }
}
