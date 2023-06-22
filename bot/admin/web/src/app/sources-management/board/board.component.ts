import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { Subject, takeUntil } from 'rxjs';
import { BotConfigurationService } from '../../core/bot-configuration.service';
import { BotApplicationConfiguration } from '../../core/model/configuration';
import { ConfirmDialogComponent } from '../../shared-nlp/confirm-dialog/confirm-dialog.component';
import { Source, sourceTypes } from '../models';
import { SourceManagementService } from '../source-management.service';
import { NewSourceComponent } from './new-source/new-source.component';
import { SourceImportComponent } from './source-import/source-import.component';
import { SourceNormalizationComponent } from './source-normalization/source-normalization.component';

@Component({
  selector: 'tock-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();

  configurations: BotApplicationConfiguration[];

  sourceTypes = sourceTypes;

  actionProcessing: string;

  sources: Source[];

  constructor(
    private botConfiguration: BotConfigurationService,
    private nbDialogService: NbDialogService,
    private router: Router,
    private sourcesService: SourceManagementService
  ) {
    this.actionProcessing = this.router.getCurrentNavigation().extras?.state?.action;
  }

  ngOnInit(): void {
    this.botConfiguration.configurations.pipe(takeUntil(this.destroy$)).subscribe((confs) => {
      this.configurations = confs;
      if (confs.length) {
        this.loadSources();
      }
    });
  }

  loadSources() {
    this.sourcesService
      .getSources()
      .pipe(takeUntil(this.destroy$))
      .subscribe((sources: Source[]) => {
        this.sources = sources;

        // tmp
        if (this.actionProcessing) {
          this.sources[0].isProcessing = this.actionProcessing;
          switch (this.actionProcessing) {
            case 'nlg':
              this.sources[0].step = 'splitting';
              break;
            case 'faq':
              this.sources[0].step = 'nlg';
              break;
          }
        }
        // //tmp
      });
  }

  addSource(): void {
    const modal = this.nbDialogService.open(NewSourceComponent);
    modal.componentRef.instance.onSave.subscribe((form) => {
      form.id = Math.random().toString().replace('.', '');
      this.sources.push(form);
    });
  }

  editSource(source: Source): void {
    const modal = this.nbDialogService.open(NewSourceComponent, {
      context: {
        source: source
      }
    });
    modal.componentRef.instance.onSave.subscribe((form) => {
      const srcIndex = this.sources.findIndex((src) => src === source);
      this.sources[srcIndex] = { ...this.sources[srcIndex], ...form };
    });
  }

  deleteSource(source: Source): void {
    const dialogRef = this.nbDialogService.open(ConfirmDialogComponent, {
      context: {
        title: `Remove the source '${source.name}'`,
        subtitle: 'Are you sure?',
        action: 'Remove'
      }
    });
    dialogRef.onClose.subscribe((result) => {
      if (result === 'remove') {
        this.sources = this.sources.filter((src) => {
          return source !== src;
        });
      }
    });
  }

  steps = [
    { id: 'import', label: 'Sources import', icon: 'file-add-outline', view: 'board' },
    { id: 'splitting', label: 'Sources selection', icon: 'scissors-outline', view: 'processing' },
    { id: 'done', label: 'Source imported', icon: 'checkmark-outline' }
  ];
  // { id: 'faq', label: 'Faqs creation', icon: 'book-open-outline', view: 'faqs-generation' }

  isStepDone(source: Source, stepId: string): boolean {
    const stepIndex = this.steps.findIndex((stp) => stp.id === stepId);
    const sourceStepIndex = this.steps.findIndex((stp) => stp.id === source.step);
    return sourceStepIndex >= stepIndex;
  }

  stepAction(source: Source, stepId: string) {
    if (source.isProcessing) {
      this.nbDialogService.open(ConfirmDialogComponent, {
        context: {
          title: `Treatment in progress`,
          subtitle: 'Please be patient',
          action: 'Ok'
        }
      });
      return;
    }

    const stepIndex = this.steps.findIndex((stp) => stp.id === stepId);

    if (stepIndex === 0) {
      this.importSource(source);
    } else {
      const sourceStepIndex = this.steps.findIndex((stp) => stp.id === source.step);
      if (stepIndex - sourceStepIndex > 1) {
        this.nbDialogService.open(ConfirmDialogComponent, {
          context: {
            title: `Stage inaccessible`,
            subtitle: 'A preliminary step must be taken first.',
            action: 'Ok'
          }
        });
      } else {
        const targetStep = this.steps[stepIndex];
        if (!targetStep.view) {
          return;
        }

        this.router.navigate([`sources-management/${targetStep.view}/${source.id}`]);
      }
    }
  }

  importSource(source: Source) {
    const modal = this.nbDialogService.open(SourceImportComponent, {
      context: {
        source: source
      }
    });
    modal.componentRef.instance.onImport.subscribe((sourceRawData) => {
      source.rawData = sourceRawData;
      this.normalizeSource(source);
    });
  }

  normalizeSource(source: Source) {
    const modal = this.nbDialogService.open(SourceNormalizationComponent, {
      context: {
        source: source
      }
    });
    modal.componentRef.instance.onNormalize.subscribe((normalization) => {
      console.log(normalization);
      source.normalization = normalization;
      source.step = 'import';
      modal.close();
      this.stepAction(source, 'splitting');
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
