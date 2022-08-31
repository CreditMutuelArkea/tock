import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NbDialogRef, NbToastrService } from '@nebular/theme';
import { Subject, Subscription } from 'rxjs';
import { first, take, takeUntil } from 'rxjs/operators';

import { ConfirmDialogComponent } from '../../shared-nlp/confirm-dialog/confirm-dialog.component';
import { DialogService } from '../../core-nlp/dialog.service';
import { Filter, Saga, Scenario, SCENARIO_STATE } from '../models';
import { ScenarioService } from '../services/scenario.service';
import { StateService } from '../../core-nlp/state.service';
import { BotApplicationConfiguration } from '../../core/model/configuration';
import { BotConfigurationService } from '../../core/bot-configuration.service';
import { ScenarioEditComponent } from '../scenario-edit/scenario-edit.component';
import { Pagination } from '../../shared/pagination/pagination.component';
import { OrderBy, orderBy } from '../../shared/utils';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ScenarioImportComponent } from './scenario-import/scenario-import.component';

@Component({
  selector: 'scenarios-list',
  templateUrl: './scenarios-list.component.html',
  styleUrls: ['./scenarios-list.component.scss']
})
export class ScenariosListComponent implements OnInit, OnDestroy {
  @ViewChild('scenarioEditComponent') scenarioEditComponent: ScenarioEditComponent;
  @ViewChild('duplicationModal') duplicationModal: TemplateRef<any>;

  configurations: BotApplicationConfiguration[];
  destroy$ = new Subject();
  scenarios: Scenario[] = [];
  filteredScenarios: Scenario[] = [];
  paginatedScenarios: Scenario[] = [];
  scenarioEdit?: Scenario;
  sagaEdit?: Saga;
  categoriesCache: string[] = [];
  tagsCache: string[] = [];

  isSidePanelOpen: boolean = false;

  loading = {
    delete: false,
    edit: false,
    list: false
  };

  pagination: Pagination = {
    start: 0,
    end: 0,
    size: 10,
    total: 0
  };

  private currentFilters: Filter = { search: '', tags: [] };
  private currentOrderByCriteria: OrderBy = {
    criteria: 'name',
    reverse: false,
    secondField: 'name'
  };

  constructor(
    private botConfigurationService: BotConfigurationService,
    private dialogService: DialogService,
    private scenarioService: ScenarioService,
    private toastrService: NbToastrService,
    private router: Router,
    protected stateService: StateService
  ) {}

  ngOnInit() {
    this.botConfigurationService.configurations
      .pipe(takeUntil(this.destroy$))
      .subscribe((confs) => {
        this.configurations = confs;
        this.closeSidePanel();
      });

    this.loading.list = true;

    this.subscribeToScenarios();

    this.stateService.configurationChange.pipe(takeUntil(this.destroy$)).subscribe((_) => {
      this.subscribeToScenarios(true);
    });
  }

  scenariosSubscription: Subscription;
  subscribeToScenarios(forceReload = false) {
    if (this.scenariosSubscription) this.scenariosSubscription.unsubscribe();

    this.scenariosSubscription = this.scenarioService
      .getScenarios(forceReload)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: Scenario[]) => {
        this.loading.list = false;
        this.scenarios = [...data];
        this.pagination.total = data.length;
        this.filterScenarios(this.currentFilters, false);
        this.orderBy(this.currentOrderByCriteria);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addOrEditScenario(scenario?: Scenario): void {
    if (this.scenarioEditComponent) {
      this.scenarioEditComponent
        .close()
        .pipe(take(1))
        .subscribe((res) => {
          if (res != 'cancel') {
            setTimeout(() => {
              this.addOrEditScenario(scenario);
            }, 200);
          }
        });
    } else {
      if (scenario) this.edit(scenario);
      else this.add();
    }
  }

  add(): void {
    this.scenarioEdit = {
      id: null,
      category: '',
      description: '',
      name: '',
      tags: [],
      state: SCENARIO_STATE.draft,
      applicationId: this.stateService.currentApplication._id
    } as Scenario;
    this.isSidePanelOpen = true;
  }

  edit(scenario: Scenario): void {
    this.scenarioEdit = scenario;
    this.isSidePanelOpen = true;
  }

  editSaga(saga: Saga): void {
    this.sagaEdit = saga;
    this.edit(saga.scenarios[0]);
  }

  duplicationForm: FormGroup = new FormGroup({
    description: new FormControl('', [Validators.required])
  });

  get description(): FormControl {
    return this.duplicationForm.get('description') as FormControl;
  }

  get canSaveDuplication(): boolean {
    return this.isDuplicationSubmitted ? this.duplicationForm.valid : this.duplicationForm.dirty;
  }

  duplicationDialogRef: NbDialogRef<TemplateRef<any>>;
  duplicationScenario: Scenario;
  askDuplicationDescription(scenario: Scenario): void {
    this.duplicationScenario = scenario;
    this.duplicationDialogRef = this.dialogService.openDialog(this.duplicationModal);
  }

  duplicationCancel(): void {
    this.isDuplicationSubmitted = false;
    this.duplicationForm.reset();
    this.duplicationDialogRef.close();
  }

  isDuplicationSubmitted: boolean = false;
  duplicationSubmit(): void {
    this.isDuplicationSubmitted = true;
    if (this.canSaveDuplication) {
      this.duplicateScenario();
    }
  }

  duplicateScenario(): void {
    const copy = JSON.parse(JSON.stringify(this.duplicationScenario));
    delete copy.id;
    delete copy.createDate;
    delete copy.updateDate;
    copy.state = SCENARIO_STATE.draft;
    copy.description = this.duplicationForm.value.description;

    this.saveScenario({ scenario: copy });
    this.duplicationCancel();
  }

  askDeleteSaga(saga: Saga) {
    const deleteAction = 'delete';
    const dialogRef = this.dialogService.openDialog(ConfirmDialogComponent, {
      context: {
        title: `Delete all scenarios of saga "${saga.name}"`,
        subtitle:
          'Are you sure you want to delete all the scenarios of this saga and, if applicable, the corresponding TickStory?',
        action: deleteAction
      }
    });
    dialogRef.onClose.subscribe((result) => {
      if (result === deleteAction) {
        this.deleteSaga(saga);
      }
    });
  }

  deleteSaga(saga: Saga) {
    this.loading.delete = true;

    this.scenarioService
      .deleteSaga(saga.sagaId)
      .pipe(first())
      .subscribe({
        next: () => {
          this.toastrService.success(`Saga scenarios successfully deleted`, 'Success', {
            duration: 5000,
            status: 'success'
          });
          this.loading.delete = false;
          alert('TODO : delete corresponding TickStory if any => endpoint required');
        },
        error: () => {
          this.loading.delete = false;
        }
      });
  }

  delete(scenario: Scenario): void {
    const deleteAction = 'delete';
    const dialogRef = this.dialogService.openDialog(ConfirmDialogComponent, {
      context: {
        title: `Delete scenario "${scenario.name}"`,
        subtitle: 'Are you sure you want to delete the scenario ?',
        action: deleteAction
      }
    });
    dialogRef.onClose.subscribe((result) => {
      if (result === deleteAction) {
        if (scenario.id === this.scenarioEdit?.id) {
          this.closeSidePanel();
        }
        this.deleteScenario(scenario.id);
      }
    });
  }

  closeSidePanel(): void {
    this.isSidePanelOpen = false;
    this.scenarioEdit = undefined;
    this.sagaEdit = undefined;
  }

  deleteScenario(id: string): void {
    this.loading.delete = true;

    this.scenarioService
      .deleteScenario(id)
      .pipe(first())
      .subscribe({
        next: () => {
          this.toastrService.success(`Scenario successfully deleted`, 'Success', {
            duration: 5000,
            status: 'success'
          });
          this.loading.delete = false;
        },
        error: () => {
          this.loading.delete = false;
        }
      });
  }

  saveScenario(result) {
    this.loading.edit = true;

    if (!result.scenario.id) {
      this.scenarioService
        .postScenario(result.scenario)
        .pipe(first())
        .subscribe({
          next: (newScenario) => {
            this.loading.edit = false;
            this.toastrService.success(`Scenario successfully created`, 'Success', {
              duration: 5000,
              status: 'success'
            });
            if (result.redirect) {
              this.router.navigateByUrl(`/scenarios/${newScenario.id}`);
            } else {
              this.closeSidePanel();
            }
          },
          error: () => {
            this.loading.edit = false;
          }
        });
    } else {
      if (this.sagaEdit) {
        this.saveSagaEdition(result);
      } else {
        this.scenarioService
          .putScenario(result.scenario.id, result.scenario)
          .pipe(first())
          .subscribe({
            next: (newScenario) => {
              this.loading.edit = false;
              this.toastrService.success(`Scenario successfully updated`, 'Success', {
                duration: 5000,
                status: 'success'
              });
              if (result.redirect) {
                this.router.navigateByUrl(`/scenarios/${newScenario.id}`);
              } else {
                this.closeSidePanel();
              }
            },
            error: () => {
              this.loading.edit = false;
            }
          });
      }
    }
  }

  saveSagaEdition(result, index = 0) {
    const scenarioUpdate = JSON.parse(JSON.stringify(this.sagaEdit.scenarios[index]));
    delete scenarioUpdate.createDate;
    delete scenarioUpdate.updateDate;

    scenarioUpdate.name = result.scenario.name;
    scenarioUpdate.description = result.scenario.description;
    scenarioUpdate.category = result.scenario.category;
    scenarioUpdate.tags = result.scenario.tags;

    this.scenarioService
      .putScenario(scenarioUpdate.id, scenarioUpdate)
      .pipe(first())
      .subscribe({
        next: (res) => {
          if (this.sagaEdit.scenarios.length > index) {
            this.saveSagaEdition(result, index + 1);
          } else {
            this.loading.edit = false;
            this.toastrService.success(`Scenarios successfully updated`, 'Success', {
              duration: 5000,
              status: 'success'
            });
            this.closeSidePanel();
          }
        },
        error: () => {
          this.loading.edit = false;
        }
      });
  }

  filterScenarios(filters: Filter, resetPaginationStart: boolean = true): void {
    const { search, tags } = filters;
    this.currentFilters = filters;

    this.filteredScenarios = this.scenarios.filter((scenario: Scenario) => {
      if (
        search &&
        !(
          scenario.name.toUpperCase().includes(search.toUpperCase()) ||
          scenario.description.toUpperCase().includes(search.toUpperCase())
        )
      ) {
        return;
      }

      if (tags?.length && !scenario.tags.some((tag) => tags.includes(tag))) {
        return;
      }

      return scenario;
    });

    this.resetPaginationAfterFiltering(resetPaginationStart);

    this.orderBy(this.currentOrderByCriteria);
  }

  resetPaginationAfterFiltering(resetPaginationStart: boolean): void {
    if (resetPaginationStart) {
      this.pagination.start = 0;
    }
    this.pagination.total = this.filteredScenarios.length;

    const pageEnd = this.pagination.start + this.pagination.size;
    this.pagination.end = pageEnd < this.pagination.total ? pageEnd : this.pagination.total;

    if (this.pagination.start === this.pagination.end) {
      const pageStart = this.pagination.start - this.pagination.size;
      this.pagination.start = pageStart < 0 ? 0 : pageStart;
    }
  }

  paginateScenario(scenarios: Scenario[]): void {
    if (!this.pagination.end) {
      const pageEnd = this.pagination.end + this.pagination.size;
      this.pagination.end = scenarios.length > pageEnd ? pageEnd : scenarios.length;
    }

    this.paginatedScenarios = this.filteredScenarios.slice(
      this.pagination.start,
      this.pagination.end
    );
  }

  paginationChange(): void {
    this.paginateScenario(this.scenarios);
  }

  orderBy(event: OrderBy): void {
    this.currentOrderByCriteria = {
      ...this.currentOrderByCriteria,
      criteria: event.criteria,
      reverse: event.reverse
    };

    this.filteredScenarios = orderBy<Scenario>(
      this.filteredScenarios,
      this.currentOrderByCriteria.criteria,
      this.currentOrderByCriteria.reverse,
      this.currentOrderByCriteria.secondField
    );

    this.paginateScenario(this.filteredScenarios);
  }

  callImportScenario() {
    const modal = this.dialogService.openDialog(ScenarioImportComponent, {
      context: {}
    });
    const validate = modal.componentRef.instance.validate
      .pipe(takeUntil(this.destroy$))
      .subscribe((importJson) => {
        this.importAllScenarios(importJson);

        validate.unsubscribe();
        modal.close();
      });
  }

  importAllScenarios(importJsons: JSON[], index = 0) {
    this.loading.edit = true;
    if (index < importJsons.length && importJsons[index]) {
      this.importScenario(importJsons, index);
    } else {
      this.loading.edit = false;
      this.toastrService.success(`Scenario successfully imported`, 'Success', {
        duration: 5000,
        status: 'success'
      });
    }
  }

  importScenario(importJsons, index) {
    const json = importJsons[index];
    delete json.id;
    delete json.applicationId;
    delete json.createDate;
    delete json.updateDate;

    json.state = SCENARIO_STATE.draft;
    json.applicationId = this.stateService.currentApplication._id;
    this.scenarioService
      .postScenario(json)
      .pipe(first())
      .subscribe({
        next: (newScenario) => {
          this.importAllScenarios(importJsons, index + 1);
        },
        error: () => {
          this.importAllScenarios(importJsons, index + 1);
        }
      });
  }
}
