import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { Router } from '@angular/router';

import { Intent, Sentence, SentenceStatus } from '../../../model/nlp';
import { StateService } from '../../../core-nlp/state.service';
import { UserRole } from '../../../model/auth';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { DialogService } from 'src/app/core-nlp/dialog.service';
import { SentencesService } from 'src/app/faq/common/sentences.service';
import { truncate } from 'src/app/faq/common/util/string-utils';

enum Action {
  DELETE = 'DELETE',
  TOGGLE = 'TOGGLE',
  VALIDATE = 'VALIDATE',
  UNKNOWN = 'UNKNOWN'
}

@Component({
  selector: 'tock-faq-training-list',
  templateUrl: './faq-training-list.component.html',
  styleUrls: ['./faq-training-list.component.scss']
})
export class FaqTrainingListComponent implements OnInit, OnDestroy {
  @Input() sentences: Sentence[] = [];

  @Output() onReload = new EventEmitter<boolean>();

  @Output() onDelete = new EventEmitter<number>();
  @Output() onToggle = new EventEmitter<number>();
  @Output() onValidate = new EventEmitter<number>();
  @Output() onUnknown = new EventEmitter<number>();

  private readonly destroy$: Subject<boolean> = new Subject();

  intents: Intent[] = [];
  UserRole = UserRole;
  Action = Action;

  constructor(
    private readonly dialogService: DialogService,
    private readonly sentencesService: SentencesService,
    public readonly state: StateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.state.currentIntents.pipe(takeUntil(this.destroy$)).subscribe({
      next: (intents: Intent[]) => {
        this.intents = intents;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  redirectToFaqManagement(sentence: Sentence): void {
    this.router.navigate(['faq/qa'], { state: { question: sentence.text } });
  }

  selectIntent(sentence: Sentence, category: 'placeholder' | 'probability'): string | number {
    switch (category) {
      case 'placeholder':
        return sentence.getIntentLabel(this.state);
      case 'probability':
        return Math.trunc(sentence.classification.intentProbability * 100);
    }
  }

  addIntentToSentence(intentId: string, sentence: Sentence): void {
    sentence = sentence.withIntent(this.state, intentId);
  }

  async handleAction(action: Action, sentence: Sentence): Promise<void> {
    switch (action) {
      case Action.DELETE:
        sentence.status = SentenceStatus.deleted;
        await this.sentencesService.save(sentence, this.destroy$).pipe(take(1)).toPromise();
        this.onReload.emit(true);
        break;
    }

    this.dialogService.notify(`Deleted`, truncate(sentence.text), {
      duration: 2000,
      status: 'basic'
    });
  }
  /*
  public async validate(): Promise<void> {
    const intentId = this.sentence.classification.intentId;
    if (!intentId) {
      this.dialog.notify(`Please select an intent first`);
      return;
    }

    if (intentId === Intent.unknown) {
      this.sentence.classification.intentId = Intent.unknown;
      this.sentence.classification.entities = [];
    }
    this.sentence.status = SentenceStatus.validated;

    await this.sentencesService.save(this.sentence, this.destroy$).pipe(take(1)).toPromise();

    this.dialog.notify(`Validated`, truncate(this.sentence.text), {
      duration: 2000,
      status: 'basic'
    });
  }

  public async unknown(): Promise<void> {
    this.sentence.classification.intentId = Intent.unknown;
    this.sentence.classification.entities = [];
    this.sentence.status = SentenceStatus.validated;

    await this.sentencesService.save(this.sentence, this.destroy$).pipe(take(1)).toPromise();

    this.dialog.notify(`Unknown`, truncate(this.sentence.text), {
      duration: 2000,
      status: 'basic'
    });
  }

  public async remove(): Promise<void> {
    this.sentence.status = SentenceStatus.deleted;

    await this.sentencesService.save(this.sentence, this.destroy$).pipe(take(1)).toPromise();

    this.dialog.notify(`Deleted`, truncate(this.sentence.text), {
      duration: 2000,
      status: 'basic'
    });
  }*/
}
