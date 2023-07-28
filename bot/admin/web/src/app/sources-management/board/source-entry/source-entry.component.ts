import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { Subject } from 'rxjs';
import { ConfirmDialogComponent } from '../../../shared-nlp/confirm-dialog/confirm-dialog.component';
import { IndexingSession, IndexingSessionStatus, Source, sourceTypes } from '../../models';

interface StepDefinition {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'tock-source-entry',
  templateUrl: './source-entry.component.html',
  styleUrls: ['./source-entry.component.scss']
})
export class SourceEntryComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();

  @Input() source: Source;

  @Output() onEdit = new EventEmitter<Source>();
  @Output() onDelete = new EventEmitter<Source>();
  @Output() onToggleEnabled = new EventEmitter<Source>();

  sourceTypes = sourceTypes;

  constructor(private nbDialogService: NbDialogService) {}

  steps = {
    file: [
      { id: 'import', label: 'Data import', icon: 'file-add-outline' },
      { id: 'indexing', label: 'Text processing', icon: 'scissors-outline' },
      { id: 'embedding', label: 'Word embedding', icon: 'menu-arrow-outline' },
      { id: 'done', label: 'Done', icon: 'checkmark-outline' }
    ],
    remote: [
      { id: 'scraping', label: 'Data extraction', icon: 'code-download-outline' },
      { id: 'indexing', label: 'Text processing', icon: 'scissors-outline' },
      { id: 'embedding', label: 'Word embedding', icon: 'menu-arrow-outline' },
      { id: 'done', label: 'Done', icon: 'checkmark-outline' }
    ]
  };

  ngOnInit(): void {}

  getSourceSteps(): StepDefinition[] {
    return this.steps[this.source.source_type];
  }

  isCurrentIndexingSession(session: IndexingSession): boolean {
    return session.id === this.source.current_indexing_session_id;
  }

  isSessionComplete(session: IndexingSession) {
    return session.status === IndexingSessionStatus.complete;
  }

  getCurrentIndexingSession(): IndexingSession {
    return this.source.indexing_sessions?.find((session) => session.id === this.source.current_indexing_session_id);
  }

  isStepDone(source: Source, stepId: string): boolean {
    const currentSession = this.getCurrentIndexingSession();
    if (currentSession) {
      if (currentSession.status === IndexingSessionStatus.complete) return true;

      if (currentSession.status === IndexingSessionStatus.running) {
        // const stepIndex = this.getSourceSteps().findIndex((stp) => stp.id === stepId);
        // const sourceStepIndex = this.getSourceSteps().findIndex((stp) => stp.id === source.step);
        // return sourceStepIndex >= stepIndex;
      }
    }
    return false;
  }

  setSessionAsCurrent(session: IndexingSession): void {
    const confirmLabel = 'Set as current';
    const dialogRef = this.nbDialogService.open(ConfirmDialogComponent, {
      context: {
        title: `Set session "${session.id}" as current data source`,
        subtitle: 'Are you sure?',
        action: confirmLabel
      }
    });
    dialogRef.onClose.subscribe((result) => {
      if (result?.toLowerCase() === confirmLabel.toLowerCase()) {
        console.log('TODO');
      }
    });
  }

  deleteSession(session: IndexingSession): void {
    const confirmLabel = 'Remove';
    const dialogRef = this.nbDialogService.open(ConfirmDialogComponent, {
      context: {
        title: `Remove the session "${session.id}"`,
        subtitle: 'Are you sure?',
        action: confirmLabel
      }
    });
    dialogRef.onClose.subscribe((result) => {
      if (result?.toLowerCase() === confirmLabel.toLowerCase()) {
        console.log('TODO');
      }
    });
  }

  editSource(event: PointerEvent): void {
    event.stopPropagation();
    this.onEdit.emit(this.source);
  }

  deleteSource(event: PointerEvent): void {
    event.stopPropagation();
    this.onDelete.emit(this.source);
  }

  toggleSourceEnabled(): void {
    this.onToggleEnabled.emit(this.source);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
