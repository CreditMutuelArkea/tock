import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SentenceTrainingSentenceService {
  public sentenceTrainingSentenceCommunication = new Subject<any>();

  refreshTokens(): void {
    this.sentenceTrainingSentenceCommunication.next({
      type: 'refreshTokens'
    });
  }

  documentClick(): void {
    this.sentenceTrainingSentenceCommunication.next({
      type: 'documentClick'
    });
  }

  componentMouseUp(event: MouseEvent): void {
    this.sentenceTrainingSentenceCommunication.next({
      type: 'componentMouseUp',
      event
    });
  }
}
