import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { SearchMark } from '../../model/commons';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsService } from '../../analytics/analytics.service';
import { UserFilter } from '../../analytics/users/users.component';
import { StateService } from '../../core-nlp/state.service';
import { DialogReportQuery } from '../../analytics/dialogs/dialogs';
import { DialogFilter } from '../../analytics/dialogs/dialogs.component';
import { BotConfigurationService } from '../../core/bot-configuration.service';
import { BotApplicationConfiguration } from '../../core/model/configuration';
import { ActionReport, BotMessage, DialogReport } from '../../shared/model/dialog-data';
import { RagMonitoringService } from './rag-monitoring.service';

@Component({
  selector: 'tock-rag-monitoring',
  templateUrl: './rag-monitoring.component.html',
  styleUrls: ['./rag-monitoring.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RagMonitoringComponent implements OnInit, OnDestroy {
  destroy$: Subject<unknown> = new Subject();
  loading: boolean = true;
  configurations: BotApplicationConfiguration[];

  filter: UserFilter = new UserFilter([], false);

  cursor: number = 0;
  pageSize: number = 10;
  mark: SearchMark;

  dialogs: DialogReport[];

  constructor(
    public state: StateService,
    private analytics: AnalyticsService,
    private botConfiguration: BotConfigurationService,
    private cd: ChangeDetectorRef,
    private ragMonitoringService: RagMonitoringService
  ) {}

  ngOnInit(): void {
    this.botConfiguration.configurations.pipe(takeUntil(this.destroy$)).subscribe((confs: BotApplicationConfiguration[]) => {
      this.loading = true;
      this.configurations = confs;

      this.dialogs = [];

      if (confs.length) {
        this.loadDialogs();
      } else {
        this.loading = false;
      }
      this.cd.markForCheck();
    });
  }

  @HostListener('document:click', ['$event'])
  documentClick(event: MouseEvent) {
    this.ragMonitoringService.documentClick(event);
  }

  private buildDialogQuery(): DialogReportQuery {
    const app = this.state.currentApplication;
    const language = this.state.currentLocale;

    const filter: DialogFilter = new DialogFilter(true, false);
    return new DialogReportQuery(
      app.namespace,
      app.name,
      language,
      0,
      10,
      filter.exactMatch,
      null,
      filter.dialogId,
      filter.text,
      filter.intentName,
      filter.connectorType,
      filter.displayTests
    );
  }

  loadDialogs() {
    this.analytics.dialogs(this.buildDialogQuery()).subscribe((r) => {
      if (r.rows.length != 0) {
        this.dialogs = r.rows;
      }
      this.loading = false;
      this.cd.markForCheck();
    });
  }

  clearMessage(event: { dialog: DialogReport; message: BotMessage }) {
    const dialog = this.dialogs.find((d) => d === event.dialog);
    let canClearDialog = true;
    dialog.actions.forEach((action) => {
      if (action.isBot()) {
        if (!action.message['_validated'] && !action.message['_signaled']) {
          canClearDialog = false;
        }
      }
    });

    if (canClearDialog) {
      this.dialogs = this.dialogs.filter((d) => d !== dialog);
    }
  }

  refresh() {
    this.loading = true;
    this.loadDialogs();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
