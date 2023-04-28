import { saveAs } from 'file-saver-es';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { FaqDefinitionExtended } from '../faq-management.component';
import { StateService } from '../../../core-nlp/state.service';
import { ChoiceDialogComponent } from '../../../shared/components';
import { NbDialogService } from '@nebular/theme';

@Component({
  selector: 'tock-faq-management-list',
  templateUrl: './faq-management-list.component.html',
  styleUrls: ['./faq-management-list.component.scss']
})
export class FaqManagementListComponent {
  @Input() faqs!: FaqDefinitionExtended[];
  @Input() selectedFaq?: FaqDefinitionExtended;

  @Output() onEdit = new EventEmitter<FaqDefinitionExtended>();
  @Output() onDelete = new EventEmitter<FaqDefinitionExtended>();
  @Output() onEnable = new EventEmitter<FaqDefinitionExtended>();

  constructor(private state: StateService, private nbDialogService: NbDialogService) {}

  toggleEnabled(faq: FaqDefinitionExtended) {
    let action = 'Enable';
    if (faq.enabled) {
      action = 'Disable';
    }

    const dialogRef = this.nbDialogService.open(ChoiceDialogComponent, {
      context: {
        title: `${action} faq "${faq.title}"`,
        subtitle: `Are you sure you want to ${action.toLowerCase()} this faq ?`,
        actions: [{ actionName: 'cancel', buttonStatus: 'basic', ghost: true }, { actionName: action }]
      }
    });
    dialogRef.onClose.subscribe((result) => {
      if (result === action.toLowerCase()) {
        this.onEnable.emit(faq);
      }
    });
  }

  editFaq(faq: FaqDefinitionExtended): void {
    this.onEdit.emit(faq);
  }

  delete(faq: FaqDefinitionExtended): void {
    const deleteAction = 'delete';
    const dialogRef = this.nbDialogService.open(ChoiceDialogComponent, {
      context: {
        title: `Delete faq "${faq.title}"`,
        subtitle: 'Are you sure you want to delete this faq ?',
        actions: [
          { actionName: 'cancel', buttonStatus: 'basic', ghost: true },
          { actionName: deleteAction, buttonStatus: 'danger' }
        ],
        modalStatus: 'danger'
      }
    });
    dialogRef.onClose.subscribe((result) => {
      if (result === deleteAction) {
        this.onDelete.emit(faq);
      }
    });
  }

  download(faq: FaqDefinitionExtended): void {
    const jsonBlob = new Blob([JSON.stringify(faq)], {
      type: 'application/json'
    });

    saveAs(jsonBlob, `${this.state.currentApplication.name}_${this.state.currentLocale}_faq_${faq.title}.json`);
  }
}
