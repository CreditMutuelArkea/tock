import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { AnalyticsService } from '../../../analytics/analytics.service';
import { DialogReportQuery } from '../../../analytics/dialogs/dialogs';
import { StateService } from '../../../core-nlp/state.service';
import { Sentence } from '../../../model/nlp';
import { SentenceExtended } from '../faq-training.component';

@Component({
  selector: 'tock-faq-training-dialog',
  templateUrl: './faq-training-dialog.component.html',
  styleUrls: ['./faq-training-dialog.component.scss']
})
export class FaqTrainingDialogComponent implements OnChanges, OnDestroy {
  private readonly destroy$: Subject<boolean> = new Subject();

  @Input() sentence!: Sentence;
  @Output() onClose = new EventEmitter();

  constructor(
    private state: StateService,
    private readonly analyticsService: AnalyticsService,
    private readonly elementRef: ElementRef
  ) {}

  dialogs = [];
  displayedDialog;
  displayedDialogIndex = 0;

  close() {
    this.onClose.emit();
  }

  displayDialog(index) {
    this.displayedDialogIndex = index;
    this.displayedDialog = this.dialogs[this.displayedDialogIndex];
    this.scrollToCurrent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !changes.sentence?.previousValue ||
      (changes.sentence?.currentValue &&
        changes.sentence.currentValue.text != changes.sentence.previousValue.text)
    ) {
      this.sentence = changes.sentence.currentValue;
      const query: DialogReportQuery = this.buildDialogQuery(this.sentence.text);

      this.analyticsService
        .dialogs(query)
        .pipe(take(1))
        .subscribe((res) => {
          this.dialogs = res.rows;
          this.displayedDialogIndex = 0;
          this.displayedDialog = this.dialogs[this.displayedDialogIndex];
          this.scrollToCurrent();
        });
    }
  }

  scrollToCurrent() {
    window.setTimeout(() => {
      const nativeElement: HTMLElement = this.elementRef.nativeElement;
      const found: Element | null = nativeElement.querySelector('.currentsentence');
      if (found) {
        found.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      }
    }, 200);
  }

  private buildDialogQuery(sentenceText: string): DialogReportQuery {
    const app = this.state.currentApplication;
    const language = this.state.currentLocale;
    return new DialogReportQuery(
      app.namespace,
      app.name,
      language,
      0,
      99999,
      true,
      null,
      null,
      sentenceText
    );
  }

  isCurrentSentence(action) {
    if (action.isBot()) return false;
    return action.message.text == this.sentence.text;
  }

  getUserName(action) {
    if (action.isBot()) return this.userIdentities.bot.name;
    return this.userIdentities.client.name;
  }
  getUserAvatar(action) {
    if (action.isBot()) return this.userIdentities.bot.avatar;
    return this.userIdentities.client.avatar;
  }

  userIdentities = {
    client: { name: 'Human', avatar: 'assets/images/scenario-client.svg' },
    bot: { name: 'Bot', avatar: 'assets/images/scenario-bot.svg' }
  };

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
