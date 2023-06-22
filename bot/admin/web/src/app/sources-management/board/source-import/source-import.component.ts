import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { readFileAsText } from '../../../shared/utils';
import { FileValidators } from '../../../shared/validators';
import { Source, sourceTypes } from '../../models';
import Papa from 'papaparse';

@Component({
  selector: 'tock-source-import',
  templateUrl: './source-import.component.html',
  styleUrls: ['./source-import.component.scss']
})
export class SourceImportComponent {
  @Input() source?: Source;

  @Output() onImport = new EventEmitter();

  sourceTypes = sourceTypes;
  isImportSubmitted: boolean = false;

  constructor(public dialogRef: NbDialogRef<SourceImportComponent>) {}

  importForm: FormGroup = new FormGroup({
    filesSources: new FormControl<File[]>(
      [],
      [Validators.required, FileValidators.mimeTypeSupported(['text/csv'])],
      [this.checkFilesFormat()]
    )
  });

  get filesSources(): FormControl {
    return this.importForm.get('filesSources') as FormControl;
  }

  get canSaveImport(): boolean {
    return this.isImportSubmitted ? this.importForm.valid : this.importForm.dirty;
  }

  import() {
    this.isImportSubmitted = true;
    if (this.canSaveImport) {
      Papa.parse(this.filesSources.value[0], {
        header: false,
        complete: (results) => {
          this.onImport.emit(results);
          this.cancel();
        }
      });
    }
  }

  checkFilesFormat(): AsyncValidatorFn {
    return async (control: AbstractControl): Promise<ValidationErrors> | null => {
      // this.filesInError = [];
      const filesNameWithWrongFormat: string[] = [];
      const readers = [];
      control.value.forEach((file: File) => {
        readers.push(readFileAsText(file));
      });

      // const jsons: JsonFile[] = [];
      const jsons = [];
      await Promise.all(readers).then((values) => {
        console.log(values);
        // values.forEach((result: { fileName: string; data: string }) => {
        //   try {
        //     let scenarioGroup: ScenarioGroupImport = JSON.parse(result.data);

        //     if (scenarioGroup.name && scenarioGroup['data']?.scenarioItems) {
        //       // backward compatibility : import of old scenarios export format
        //       console.log('BACKWARD COMPATIBILITY IMPORT');
        //       type LegacyScenarioFormat = ScenarioGroupImport & { data: any };
        //       const scenarioGroupCopy = deepCopy(scenarioGroup) as LegacyScenarioFormat;
        //       scenarioGroup = {
        //         name: scenarioGroupCopy.name,
        //         description: scenarioGroupCopy.description,
        //         category: scenarioGroupCopy.category,
        //         tags: scenarioGroupCopy.tags,
        //         enabled: scenarioGroupCopy.enabled,
        //         unknownAnswerId: '',
        //         versions: [
        //           {
        //             data: scenarioGroupCopy.data,
        //             state: SCENARIO_STATE.draft,
        //             comment: ''
        //           }
        //         ]
        //       };
        //       // backward compatibility end
        //     } else if (scenarioGroup.name && scenarioGroup.versions?.length) {
        //       if (!scenarioGroup.unknownAnswerId) scenarioGroup.unknownAnswerId = '';

        //       scenarioGroup.versions.forEach((scenarioVersion: ScenarioVersion) => {
        //         if (!scenarioVersion.data?.scenarioItems || !scenarioVersion.data?.mode) {
        //           filesNameWithWrongFormat.push(result.fileName);
        //         }
        //       });
        //     } else {
        //       filesNameWithWrongFormat.push(result.fileName);
        //     }

        //     if (!filesNameWithWrongFormat.includes(result.fileName)) {
        //       jsons.push({ filename: result.fileName, data: scenarioGroup });
        //     }
        //   } catch (error) {
        //     filesNameWithWrongFormat.push(result.fileName);
        //   }
        // });
      });

      return new Promise((resolve) => {
        // if (filesNameWithWrongFormat.length) {
        //   this.filesInError = [...filesNameWithWrongFormat];
        //   resolve({
        //     filesNameWithWrongFormat,
        //     message: jsons.length
        //       ? "A least one of the selected file has the wrong format and won't be imported. Please provide Json dump files from previous scenario exports."
        //       : 'None of the files provided had the required format. Please provide Json dump files from previous scenario exports.'
        //   });
        // } else {
        //   this.filesToImport = [...jsons];
        //   resolve(null);
        // }
        resolve(null);
      });
    };
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
