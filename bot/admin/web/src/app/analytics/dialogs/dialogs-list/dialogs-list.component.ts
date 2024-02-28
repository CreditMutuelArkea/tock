import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ScrollComponent } from '../../../scroll/scroll.component';
import { ActionReport, DialogReport } from '../../../shared/model/dialog-data';
import { ConnectorType } from '../../../core/model/configuration';
import { StateService } from '../../../core-nlp/state.service';
import { DialogReportQuery } from '../dialogs';
import { AnalyticsService } from '../../analytics.service';
import { BotConfigurationService } from '../../../core/bot-configuration.service';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { BotSharedService } from '../../../shared/bot-shared.service';
import { PaginatedQuery } from '../../../model/commons';
import { Observable, filter, mergeMap } from 'rxjs';
import { PaginatedResult } from '../../../model/nlp';
import { saveAs } from 'file-saver-es';
import { getDialogMessageUserAvatar, getDialogMessageUserQualifier } from '../../../shared/utils';

export class DialogFilter {
  constructor(
    public exactMatch: boolean,
    public displayTests: boolean,
    public dialogId?: string,
    public text?: string,
    public intentName?: string,
    public connectorType?: ConnectorType,
    public ratings?: number[],
    public configuration?: string,

    public intentsToHide?: string[]
  ) {}
}

@Component({
  selector: 'tock-dialogs-list',
  templateUrl: './dialogs-list.component.html',
  styleUrls: ['./dialogs-list.component.scss']
})
export class DialogsListComponent extends ScrollComponent<DialogReport> implements OnChanges {
  filter: DialogFilter = new DialogFilter(true, false);
  state: StateService;
  connectorTypes: ConnectorType[] = [];
  configurationNameList: string[];
  private loaded = false;
  @Input() ratingFilter: number[];

  intents: string[];

  dialogReportQuery: DialogReportQuery;

  constructor(
    state: StateService,
    private analytics: AnalyticsService,
    private botConfiguration: BotConfigurationService,
    private route: ActivatedRoute,
    public botSharedService: BotSharedService
  ) {
    super(state);
    this.state = state;

    this.botConfiguration.configurations.subscribe((configs) => {
      this.isSatisfactionRoute().subscribe((res) => {
        this.botSharedService.getIntentsByApplication(this.state.currentApplication._id).subscribe((intents) => (this.intents = intents));

        this.configurationNameList = configs.filter((item) => item.targetConfigurationId == null).map((item) => item.applicationId);

        if (res) {
          this.ratingFilter = [1, 2, 3, 4, 5];
        }
        this.refresh();
      });
    });
    this.botSharedService.getConnectorTypes().subscribe((confConf) => {
      this.connectorTypes = confConf.map((it) => it.connectorType);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['ratingFilter'].currentValue != changes['ratingFilter'].previousValue) {
      this.refresh();
    }
  }

  waitAndRefresh() {
    setTimeout((_) => this.refresh());
  }

  search(query: PaginatedQuery): Observable<PaginatedResult<DialogReport>> {
    this.buildDialogQuery(query);
    return this.route.queryParams.pipe(
      mergeMap((params) => {
        if (!this.loaded) {
          if (params['dialogId']) this.filter.dialogId = params['dialogId'];
          if (params['text']) this.filter.text = params['text'];
          if (params['intentName']) this.filter.intentName = params['intentName'];
          this.loaded = true;
        }
        return this.analytics.dialogs(this.dialogReportQuery);
      })
    );
  }

  dataEquals(d1: DialogReport, d2: DialogReport): boolean {
    return d1.id === d2.id;
  }

  viewAllWithThisText() {
    this.filter.dialogId = null;
    this.refresh();
  }

  private buildDialogQuery(query: PaginatedQuery) {
    this.dialogReportQuery = new DialogReportQuery(
      query.namespace,
      query.applicationName,
      query.language,
      query.start,
      query.size,
      this.filter.exactMatch,
      null,
      this.filter.dialogId,
      this.filter.text,
      this.filter.intentName,
      this.filter.connectorType,
      this.filter.displayTests,
      this.ratingFilter,
      this.filter.configuration,
      this.filter.intentsToHide
    );
  }

  isSatisfactionRoute() {
    return this.route.url.pipe(
      filter((val: UrlSegment[]) => {
        return val[0].path == 'satisfaction';
      })
    );
  }

  exportDialogs() {
    this.analytics.downloadDialogsCsv(this.dialogReportQuery).subscribe((blob) => {
      saveAs(blob, 'dialogs_with_rating.csv');
    });
    this.analytics.downloadDialogsWithIntentsCsv(this.dialogReportQuery).subscribe((blob) => {
      saveAs(blob, 'dialogs_with_rating_and_intents.csv');
    });
  }

  getUserName(action: ActionReport): string {
    return getDialogMessageUserQualifier(action.isBot());
  }

  getUserAvatar(action: ActionReport): string {
    return getDialogMessageUserAvatar(action.isBot());
  }
}
