import {
  Component,
  ElementRef,
  HostListener,
  Injectable,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Subject } from 'rxjs';
import { pluck, takeUntil, take } from 'rxjs/operators';
import {
  Scenario,
  SCENARIO_ITEM_FROM_BOT,
  SCENARIO_ITEM_FROM_CLIENT,
  SCENARIO_MODE,
  SCENARIO_STATE
} from '../models/scenario.model';
import { ScenarioService } from '../services/scenario.service';
import { ActivatedRoute, CanDeactivate, Router } from '@angular/router';
import { DialogService } from 'src/app/core-nlp/dialog.service';
import { ConfirmDialogComponent } from 'src/app/shared-nlp/confirm-dialog/confirm-dialog.component';
import { NbToastrService } from '@nebular/theme';
import { StateService } from 'src/app/core-nlp/state.service';
import { ScenarioDesignerService } from './scenario-designer.service';
import { stringifiedCleanScenario } from '../commons/utils';
import { ChoiceDialogComponent } from '../../shared/choice-dialog/choice-dialog.component';
import { Intent } from '../../model/nlp';
import { BotService } from '../../bot/bot-service';
import { I18nLabels } from '../../bot/model/i18n';

@Component({
  selector: 'scenario-designer',
  templateUrl: './scenario-designer.component.html',
  styleUrls: ['./scenario-designer.component.scss']
})
export class ScenarioDesignerComponent implements OnInit, OnDestroy {
  destroy = new Subject();
  @ViewChild('canvasWrapperElem') canvasWrapperElem: ElementRef;
  @ViewChild('canvasElem') canvasElem: ElementRef;

  scenarioId: string;
  scenario: Scenario;
  scenarioBackup: string;
  isReadonly: boolean = false;
  i18n: I18nLabels;

  readonly SCENARIO_MODE = SCENARIO_MODE;
  readonly SCENARIO_ITEM_FROM_CLIENT = SCENARIO_ITEM_FROM_CLIENT;
  readonly SCENARIO_ITEM_FROM_BOT = SCENARIO_ITEM_FROM_BOT;

  constructor(
    private scenarioService: ScenarioService,
    route: ActivatedRoute,
    private toastrService: NbToastrService,
    protected state: StateService,
    private scenarioDesignerService: ScenarioDesignerService,
    private dialogService: DialogService,
    private botService: BotService
  ) {
    route.params
      .pipe(takeUntil(this.destroy), pluck('id'))
      .subscribe((id) => (this.scenarioId = id));

    this.scenarioDesignerService.scenarioDesignerCommunication
      .pipe(takeUntil(this.destroy))
      .subscribe((evt) => {
        if (evt.type == 'updateScenarioBackup') this.updateScenarioBackup(evt.data);
      });
  }

  ngOnInit(): void {
    this.scenarioService
      .getScenario(this.scenarioId)
      .pipe(take(1))
      .subscribe((scenario) => {
        if (scenario === null) {
          return this.informNoScenarioFound();
        }

        this.updateScenarioBackup(scenario);

        this.scenario = JSON.parse(JSON.stringify(scenario));

        this.isReadonly = this.scenario.state !== SCENARIO_STATE.draft;

        if (!this.scenario.data)
          this.scenario.data = { mode: SCENARIO_MODE.writing, scenarioItems: [], contexts: [] };
        if (typeof this.scenario.data.mode == 'undefined')
          this.scenario.data.mode = SCENARIO_MODE.writing;

        this.switchMode(this.scenario.data.mode || SCENARIO_MODE.writing);
        if (!this.scenario.data.scenarioItems.length) {
          this.scenario.data.scenarioItems.push({
            id: 0,
            from: SCENARIO_ITEM_FROM_CLIENT,
            text: '',
            main: true
          });
        }
        if (!this.scenario.data.contexts) {
          this.scenario.data.contexts = [];
        }

        this.botService
          .i18nLabels()
          .pipe(take(1))
          .subscribe((results) => {
            this.i18n = results;
            this.checkDependencies();
          });
      });

    this.state.configurationChange.pipe(takeUntil(this.destroy)).subscribe((_) => {
      this.exit();
    });
  }

  checkDependencies() {
    let deletedIntents = [];
    let deletedAnswers = [];
    this.scenario.data.scenarioItems.forEach((item) => {
      if (item.intentDefinition?.intentId) {
        const existingIntent: Intent = this.state.findIntentById(item.intentDefinition.intentId);
        if (!existingIntent) {
          // console.log(
          //   'AN INTENT HAS BEEN REMOVED !!! Deleting the lapsed intentId : ' +
          //     item.intentDefinition.intentId
          // );
          delete item.intentDefinition.intentId;
          deletedIntents.push(item.intentDefinition.label || item.intentDefinition.name);
        }
      }

      if (item.tickActionDefinition?.answerId) {
        let existingAnswer = this.i18n.labels.find((ans) => {
          return ans._id === item.tickActionDefinition.answerId;
        });
        if (!existingAnswer) {
          // console.log(
          //   'AN ANSWER HAS BEEN REMOVED !!! Deleting the lapsed answerId : ' +
          //     item.tickActionDefinition.answerId
          // );
          delete item.tickActionDefinition.answerId;
          deletedAnswers.push(item.tickActionDefinition.answer);
        }
      }
    });

    if (deletedIntents.length) {
      let title = 'The following intents have been removed';
      let subtitle = '';
      deletedIntents.forEach((intent) => {
        subtitle += `• ${intent} `;
      });
      this.dialogService.openDialog(ChoiceDialogComponent, {
        context: {
          modalStatus: 'warning',
          title: title,
          subtitle: subtitle,
          actions: [{ actionName: 'Ok', buttonStatus: 'default' }]
        }
      });
    }

    if (deletedAnswers.length) {
      let title = 'The following answers have been removed';
      let subtitle = '';
      deletedAnswers.forEach((answer) => {
        subtitle += `• ${answer} `;
      });
      this.dialogService.openDialog(ChoiceDialogComponent, {
        context: {
          modalStatus: 'warning',
          title: title,
          subtitle: subtitle,
          actions: [{ actionName: 'Ok', buttonStatus: 'default' }]
        }
      });
    }
  }

  informNoScenarioFound() {
    const modal = this.dialogService.openDialog(ChoiceDialogComponent, {
      context: {
        title: `No scenario found`,
        subtitle: 'No scenario with this identifier was found',
        actions: [{ actionName: 'Ok', buttonStatus: 'default' }]
      }
    });
    modal.onClose.subscribe((res) => {
      this.exit();
    });
  }

  switchMode(mode): void {
    this.scenario.data.mode = mode;
  }

  save(exit: boolean = false, silent: boolean = false): void {
    if (this.isReadonly) return;

    this.scenarioDesignerService.saveScenario(this.scenarioId, this.scenario).subscribe((data) => {
      if (!silent) {
        this.toastrService.success(`Scenario successfully saved`, 'Success', {
          duration: 5000,
          status: 'success'
        });
      }

      if (exit) this.exit();
    });
  }

  updateScenarioBackup(scenario: Scenario): void {
    this.scenarioBackup = JSON.stringify(scenario);
  }

  exit(): void {
    this.scenarioDesignerService.exitDesigner();
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (!this.canDeactivate()) {
      $event.returnValue = true;
    }
  }

  canDeactivate(): boolean {
    if (this.isReadonly) return true;
    return this.scenarioBackup == stringifiedCleanScenario(this.scenario);
  }
}

@Injectable()
export class ScenarioDesignerNavigationGuard implements CanDeactivate<any> {
  constructor(private dialogService: DialogService) {}

  canDeactivate(component: any) {
    const canDeactivate = component.canDeactivate();

    if (!canDeactivate) {
      const subject = new Subject<boolean>();
      const dialogResponseVerb = 'Exit';
      const modal = this.dialogService.openDialog(ConfirmDialogComponent, {
        context: {
          title: `You're about to leave without saving the changes`,
          subtitle: 'Are you sure?',
          action: dialogResponseVerb
        }
      });
      modal.onClose.subscribe((res) => {
        subject.next(res == dialogResponseVerb.toLowerCase());
      });

      return subject.asObservable();
    }
    return true;
  }
}
