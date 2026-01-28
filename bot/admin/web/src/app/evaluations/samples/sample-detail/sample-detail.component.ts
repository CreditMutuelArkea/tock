import { Component, Inject, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EvaluationSampleData } from '../temp-data';
import {
  EvaluationDefinition,
  EvaluationStatus,
  EvaluationSampleDefinition,
  EvaluationSampleStatus,
  EvaluationSampleDataDefinition
} from '../models';
import { ActionReport } from '../../../shared/model/dialog-data';
import { Pagination } from '../../../shared/components';
import { Subject } from 'rxjs';
import { StateService } from '../../../core-nlp/state.service';
import { DialogReportQuery } from '../../../analytics/dialogs/dialogs';
import { DialogListFilters } from '../../../analytics/dialogs/dialogs-list/dialogs-list-filters/dialogs-list-filters.component';
import { SortOrder } from '../../../shared/model/misc';
import { AnalyticsService } from '../../../analytics/analytics.service';
import { DatePipe, DOCUMENT } from '@angular/common';
import { scrollToPageTop } from '../../../shared/utils';
import { NbDialogService } from '@nebular/theme';
import { getEvaluationRate, getSampleCoverage } from '../utils';
import { ResponseIssueReason } from '../../../shared/model/response-issue';
import { generateSampleReport } from '../generate-sample-report';

@Component({
  selector: 'tock-sample-detail',
  templateUrl: './sample-detail.component.html',
  styleUrl: './sample-detail.component.scss'
})
export class SampleDetailComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<boolean> = new Subject();

  loading: boolean = false;
  sample: EvaluationSampleDefinition;
  evaluationSampleStatus = EvaluationSampleStatus;
  detailsVisible: boolean = false;

  @ViewChild('sampleValidationModal') sampleValidationModal: TemplateRef<any>;

  constructor(
    private route: ActivatedRoute,
    public state: StateService,
    private analytics: AnalyticsService,
    private nbDialogService: NbDialogService,
    private datePipe: DatePipe,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.loading = true;
    if (history.state?.formData) {
      this.sample = history.state?.formData;
      this.sample.dialogsCount = this.sample.requestedDialogCount; // Mocked dialogs count
      this.sample.totalDialogCount = 1500; // Mocked total dialogs
      this.refresh();
    } else {
      const samples = EvaluationSampleData as EvaluationSampleDefinition[];
      this.route.params.subscribe((params) => {
        const sampleId = params['id'];
        this.sample = samples.find((s) => s._id === sampleId);
        this.refresh();
      });
    }
  }

  getCoverage(): number {
    if (this.sample) return getSampleCoverage(this.sample);
  }

  switchDetails(): void {
    this.detailsVisible = !this.detailsVisible;
  }

  getEvaluationRate(type: 'positive' | 'negative'): number {
    return getEvaluationRate(this.sample, type);
  }

  isSampleCompleted(): boolean {
    if (!this.sample) {
      return false;
    }

    const { positiveCount, negativeCount } = this.sample.evaluationsResult;
    const totalEvaluations = positiveCount + negativeCount;

    return totalEvaluations >= this.sample.botActionCount;
  }

  getCompletionRate(): number {
    if (!this.sample) {
      return 0;
    }

    const { positiveCount, negativeCount } = this.sample.evaluationsResult;
    const totalEvaluations = positiveCount + negativeCount;

    if (totalEvaluations === 0) {
      return 0;
    }

    const completionRate = (totalEvaluations / this.sample.botActionCount) * 100;

    return Math.min(100, Math.max(0, Math.round(completionRate)));
  }

  data: EvaluationSampleDataDefinition;
  dialogReportQuery: DialogReportQuery;

  filters: Partial<DialogListFilters> = {
    exactMatch: false,
    dialogSort: SortOrder.DESC
  };

  pagination: Pagination = {
    start: 0,
    end: undefined,
    size: 10,
    total: undefined
  };

  paginationChange(pagination: Pagination): void {
    this.search(this.pagination.start, this.pagination.size, false, true, true);
  }

  onScroll() {
    if (this.loading || this.pagination.end >= this.pagination.total) return;
    this.search(this.pagination.end, this.pagination.size, true, false);
  }

  refresh() {
    this.data = null;
    this.search();
  }

  search(
    start: number = 0,
    size: number = this.pagination.size,
    add: boolean = false,
    showLoadingSpinner: boolean = true,
    scrollToTop: Boolean = false
  ) {
    const query = this.state.createPaginatedQuery(start, size);

    this.dialogReportQuery = new DialogReportQuery(
      query.namespace,
      query.applicationName,
      query.language,
      query.start,
      query.size,
      this.filters.exactMatch,
      null,
      this.filters.dialogId,
      this.filters.text,
      this.filters.intentName,
      this.filters.connectorType,
      true
    );

    this.analytics.dialogs(this.dialogReportQuery).subscribe((result) => {
      this.pagination.total = result.total;
      this.pagination.end = result.end;

      const retrievedEvaluations = [];
      // we store evaluation related to the action as an expando of the action itself
      result.rows.forEach((report) => {
        report.actions.forEach((action) => {
          if (action.isBotAnswerWithContent()) {
            const evaluation = this.getMockedEvaluation(report.id, action);
            action._evaluation = evaluation;
            retrievedEvaluations.push(evaluation);
          }
        });
      });

      if (add) {
        // this.data = [...this.data, ...result.rows];
        this.data = {
          dialogs: [...this.data.dialogs, ...result.rows],
          evaluations: [...this.data.evaluations, ...retrievedEvaluations]
        };
      } else {
        this.data = { dialogs: result.rows, evaluations: retrievedEvaluations };
        this.pagination.start = result.start;
      }

      this.loading = false;

      if (scrollToTop) {
        scrollToPageTop(this.document);
      }
    });
  }

  mockedEvaluationPositiveCount: number = 0;
  mockedEvaluationNegativeCount: number = 0;

  getMockedEvaluation(dialogId: string, action: any): EvaluationDefinition {
    const buildEvaluation = (evaluation: EvaluationStatus, reason?: ResponseIssueReason): EvaluationDefinition => ({
      _id: 'eval_' + action.id,
      evaluationSampleId: this.sample._id,
      dialogId: dialogId,
      actionId: action.id,
      status: evaluation,
      reason: reason || null,
      evaluatedBy: ['LS661', 'CX404', 'Marie-Thérèse-Antoinette de la Fontaine-Chaumont-Saint-Michel', 'Jean Dupont'][
        Math.floor(Math.random() * 3)
      ],
      evaluationDate: new Date().toISOString()
    });

    if (
      this.mockedEvaluationPositiveCount + this.mockedEvaluationNegativeCount < this.sample.botActionCount &&
      (this.mockedEvaluationPositiveCount < this.sample.evaluationsResult.positiveCount ||
        this.mockedEvaluationNegativeCount < this.sample.evaluationsResult.negativeCount)
    ) {
      const rand = Math.random();
      if (rand < 0.5 && this.mockedEvaluationPositiveCount < this.sample.evaluationsResult.positiveCount) {
        this.mockedEvaluationPositiveCount++;
        return buildEvaluation(EvaluationStatus.UP);
      } else if (this.mockedEvaluationNegativeCount < this.sample.evaluationsResult.negativeCount) {
        this.mockedEvaluationNegativeCount++;
        return buildEvaluation(
          EvaluationStatus.DOWN,
          Object.values(ResponseIssueReason)[Math.floor(Math.random() * Object.values(ResponseIssueReason).length)]
        );
      }
    }

    return buildEvaluation(EvaluationStatus.UNSET);
  }

  evaluateBotAction(evaluatedAction: { action: ActionReport; evaluation: EvaluationStatus; reason?: string }): void {
    if (evaluatedAction.action._evaluation.status === evaluatedAction.evaluation) {
      return;
    }

    const isNewEval = evaluatedAction.action._evaluation.status === EvaluationStatus.UNSET;

    evaluatedAction.action._evaluation.status = evaluatedAction.evaluation;
    if (evaluatedAction.reason) {
      evaluatedAction.action._evaluation.reason = evaluatedAction.reason;
    }

    if (isNewEval) {
      // evaluating
      if (evaluatedAction.evaluation === EvaluationStatus.UP) {
        this.sample.evaluationsResult.positiveCount++;
      } else if (evaluatedAction.evaluation === EvaluationStatus.DOWN) {
        this.sample.evaluationsResult.negativeCount++;
      }

      if (this.isDialogEvaluated(evaluatedAction.action._evaluation.dialogId)) {
        if (this.isSampleCompleted()) {
          scrollToPageTop(this.document);
        } else {
          setTimeout(() => {
            this.scrollToNextUnCompleteDialog();
          }, 300);
        }
      }
    } else {
      // changing evaluation
      if (evaluatedAction.evaluation === EvaluationStatus.UP) {
        this.sample.evaluationsResult.positiveCount++;
        this.sample.evaluationsResult.negativeCount--;
      } else if (evaluatedAction.evaluation === EvaluationStatus.DOWN) {
        this.sample.evaluationsResult.negativeCount++;
        this.sample.evaluationsResult.positiveCount--;
      }
    }
  }

  isDialogEvaluated(dialogId: string): boolean {
    const dialog = this.data.dialogs.find((d) => d.id === dialogId);
    if (dialog) {
      return !dialog.actions.some((action) => action._evaluation && action._evaluation.status === EvaluationStatus.UNSET);
    }

    return false;
  }

  scrollToNextUnCompleteDialog(): void {
    for (const dialog of this.data.dialogs) {
      if (dialog.actions.some((action) => action.isBot() && action._evaluation && action._evaluation.status === EvaluationStatus.UNSET)) {
        const element = this.document.getElementById(`dialog-wrapper-${dialog.id}`);

        if (element) {
          const offset = 12 * 16;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
        return;
      }
    }
  }

  validationModalRef;
  validationComment: string = '';

  validationModal(): void {
    this.validationModalRef = this.nbDialogService.open(this.sampleValidationModal);
  }

  closeValidationModal(): void {
    this.validationModalRef.close();
  }

  validateSample(): void {
    this.closeValidationModal();
    console.log(this.validationComment);
    this.sample.status = EvaluationSampleStatus.VALIDATED;
  }

  async exportSample1() {
    await generateSampleReport(
      this.state.currentApplication.namespace,
      this.state.currentApplication.name,
      this.datePipe,
      this.sample,
      this.data
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
