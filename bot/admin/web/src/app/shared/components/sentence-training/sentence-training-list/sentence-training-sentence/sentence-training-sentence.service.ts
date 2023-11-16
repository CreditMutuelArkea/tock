import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SentenceTrainingSentenceService {
  public sentenceTrainingSentenceCommunication = new Subject<any>();

  // assignEntity(entity): void {
  //   this.sentenceTrainingSentenceCommunication.next({
  //     type: 'assignEntity',
  //     entity: entity
  //   });
  // }

  refreshTokens(): void {
    this.sentenceTrainingSentenceCommunication.next({
      type: 'refreshTokens'
    });
  }
}
