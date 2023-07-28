import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { Subject, takeUntil } from 'rxjs';
import { BotConfigurationService } from '../../core/bot-configuration.service';
import { BotApplicationConfiguration } from '../../core/model/configuration';
import { ConfirmDialogComponent } from '../../shared-nlp/confirm-dialog/confirm-dialog.component';
import { Source, sourceTypes } from '../models';
import { SourceManagementService } from '../source-management.service';
import { NewSourceComponent } from './new-source/new-source.component';
import { SourceImportComponent } from './source-import/source-import.component';
import { SourceNormalizationCsvComponent } from './source-normalization/csv/source-normalization-csv.component';
import { SourceNormalizationJsonComponent } from './source-normalization/json/source-normalization-json.component';

@Component({
  selector: 'tock-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();

  configurations: BotApplicationConfiguration[];

  sourceTypes = sourceTypes;

  sources: Source[];

  constructor(
    private botConfiguration: BotConfigurationService,
    private nbDialogService: NbDialogService,
    private sourcesService: SourceManagementService
  ) {}

  ngOnInit(): void {
    this.botConfiguration.configurations.pipe(takeUntil(this.destroy$)).subscribe((confs) => {
      this.configurations = confs;
      if (confs.length) {
        this.loadSources();
      }
    });
  }

  loadSources(): void {
    this.sourcesService
      .getSources()
      .pipe(takeUntil(this.destroy$))
      .subscribe((sources: Source[]) => {
        this.sources = sources;
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

  toggleEnabledSource(source: Source): void {}

  importSource(source: Source): void {
    const modal = this.nbDialogService.open(SourceImportComponent, {
      context: {
        source: source
      }
    });
    modal.componentRef.instance.onImport.subscribe((result) => {
      source.source_parameters.file_format = result.fileFormat;
      source.rawData = result.data;
      this.normalizeSource(source);
    });
  }

  normalizeSource(source: Source): void {
    let modal;
    if (source.source_parameters.file_format === 'csv') {
      modal = this.nbDialogService.open(SourceNormalizationCsvComponent, {
        context: {
          source: source
        }
      });
    } else if (source.source_parameters.file_format === 'json') {
      modal = this.nbDialogService.open(SourceNormalizationJsonComponent, {
        context: {
          source: source
        }
      });
    }

    modal.componentRef.instance.onNormalize.subscribe((normalizedData) => {
      console.log(normalizedData);
      modal.close();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
