import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { ActionReport, Debug, DialogReport, Sentence, SentenceWithFootnotes } from '../../../model/dialog-data';
import { getDialogMessageUserAvatar, getDialogMessageUserQualifier } from '../../../utils';
import { NbDialogService } from '@nebular/theme';
import { TestDialogService } from '../../test-dialog/test-dialog.service';
import { Router } from '@angular/router';
import { StateService } from '../../../../core-nlp/state.service';
import { Subject } from 'rxjs';
import { NlpStatsDisplayComponent } from '../../../../test/dialog/nlp-stats-display/nlp-stats-display.component';
import { DebugViewerDialogComponent } from '../../debug-viewer-dialog/debug-viewer-dialog.component';

@Component({
  selector: 'tock-chat-ui-dialog-logger',

  templateUrl: './chat-ui-dialog-logger.component.html',
  styleUrl: './chat-ui-dialog-logger.component.scss'
})
export class ChatUiDialogLoggerComponent implements OnDestroy {
  private readonly destroy$: Subject<boolean> = new Subject();

  @Input() dialog: DialogReport;

  @Input() userMessageIsClickable?: boolean;
  @Input() botMessageIsClickable?: boolean;

  @Output() onMessageClicked = new EventEmitter();

  @Input() highlightedAction?: ActionReport;

  constructor(
    private testDialogService: TestDialogService,
    private nbDialogService: NbDialogService,
    private router: Router,
    public state: StateService
  ) {}

  getUserName(action: ActionReport): string {
    return getDialogMessageUserQualifier(action.isBot());
  }

  getUserAvatar(action: ActionReport): string {
    return getDialogMessageUserAvatar(action.isBot());
  }

  jumpToDialog(dialogId: string, actionId: string) {
    this.router.navigate(
      [`analytics/dialogs/${this.state.currentApplication.namespace}/${this.state.currentApplication._id}/${dialogId}`],
      {
        fragment: actionId
      }
    );
  }

  nbUserQuestions(): number {
    return this.dialog.actions.filter((action) => !action.isBot()).length;
  }

  nbBotAnswers(): number {
    return this.dialog.actions.filter(
      (action) =>
        action.isBot() && !action.message?.isDebug() && ((action.message as Sentence).text || (action.message as Sentence).messages?.length)
    ).length;
  }

  nbRagAnswers(): number {
    return this.dialog.actions.filter((action) => action.isBot() && action.metadata?.isGenAiRagAnswer).length;
  }

  createFaq(action: ActionReport, actionsStack: ActionReport[]) {
    const actionIndex = actionsStack.findIndex((act) => act === action);
    if (actionIndex > 0) {
      const answerSentence = action.message as unknown as SentenceWithFootnotes;
      const answer = answerSentence.text;

      let question;
      const questionAction = actionsStack[actionIndex - 1];

      if (questionAction.message.isDebug()) {
        const actionDebug = questionAction.message as unknown as Debug;
        question = actionDebug.data.condense_question || actionDebug.data.user_question;
      } else if (!questionAction.isBot()) {
        const questionSentence = questionAction.message as unknown as Sentence;
        question = questionSentence.text;
      }

      if (question && answer) {
        this.router.navigate(['faq/management'], { state: { question, answer } });
      }
    }
  }

  testDialogSentence(action: ActionReport) {
    this.testDialogService.testSentenceDialog({
      sentenceText: (action.message as unknown as Sentence).text,
      applicationId: action.applicationId,
      sentenceLocale: action._nlpStats?.locale
    });
  }

  replayDialog() {
    this.testDialogService.replayDialog(this.dialog);
  }

  displayNlpStats(action: ActionReport) {
    if (action._nlpStats) {
      this.nbDialogService.open(NlpStatsDisplayComponent, {
        context: {
          data: {
            request: JSON.stringify(action._nlpStats.nlpQuery, null, 2),
            response: JSON.stringify(action._nlpStats.nlpResult, null, 2)
          }
        }
      });
    }
  }

  openObservabilityTrace(action: ActionReport) {
    window.open(action.metadata.observabilityInfo.traceUrl, '_blank');
  }

  // containsReport(action: ActionReport): boolean {
  //   return (parseInt(action.id) % 10) % 2 === 0;
  // }

  // openReport(action: ActionReport) {
  //   this.nbDialogService.open(ReportComponent, {
  //     context: {
  //       actionReport: action
  //     }
  //   });
  // }

  showDebug(action: ActionReport) {
    this.nbDialogService.open(DebugViewerDialogComponent, {
      context: {
        debug: (action.message as Debug).data
      }
    });
  }

  messageClicked(action: ActionReport): void {
    this.onMessageClicked.emit(action);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}