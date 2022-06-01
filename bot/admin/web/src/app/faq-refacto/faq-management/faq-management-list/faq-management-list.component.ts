import { saveAs } from 'file-saver';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { FaqDefinition } from '../../models';
import { StateService } from '../../../core-nlp/state.service';
import { DialogService } from '../../../core-nlp/dialog.service';
import { ConfirmDialogComponent } from '../../../shared-nlp/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'tock-faq-management-list',
  templateUrl: './faq-management-list.component.html',
  styleUrls: ['./faq-management-list.component.scss']
})
export class FaqManagementListComponent {
  @Input() faqs!: FaqDefinition[];

  @Output() handleEdit = new EventEmitter<FaqDefinition>();
  @Output() handleDelete = new EventEmitter<FaqDefinition>();

  constructor(private state: StateService, private dialogService: DialogService) {}

  toggleEnabled($event) {
    console.log('TO DO', $event);
  }

  editFaq(faq: FaqDefinition): void {
    this.handleEdit.emit(faq);
  }

  delete(faq: FaqDefinition): void {
    const deleteAction = 'delete';
    const dialogRef = this.dialogService.openDialog(ConfirmDialogComponent, {
      context: {
        title: `Delete faq "${faq.title}"`,
        subtitle: 'Are you sure you want to delete this faq ?',
        action: deleteAction
      }
    });
    dialogRef.onClose.subscribe((result) => {
      if (result === deleteAction) {
        this.handleDelete.emit(faq);
      }
    });
  }

  download(faq: FaqDefinition): void {
    var jsonBlob = new Blob([JSON.stringify(faq)], {
      type: 'application/json'
    });

    saveAs(
      jsonBlob,
      this.state.currentApplication.name +
        '_' +
        this.state.currentLocale +
        '_faq_' +
        faq.title +
        '.json'
    );
  }
}
