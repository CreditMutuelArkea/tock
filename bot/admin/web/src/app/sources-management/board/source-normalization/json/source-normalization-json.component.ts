import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { isPrimitive } from '../../../../shared/utils';
import { dataTypesDefinition, ImportDataTypes, Source } from '../../../models';

@Component({
  selector: 'tock-source-normalization-json',
  templateUrl: './source-normalization-json.component.html',
  styleUrls: ['./source-normalization-json.component.scss']
})
export class SourceNormalizationJsonComponent {
  @Input() source?: Source;

  @Output() onNormalize = new EventEmitter();

  dataTypesDefinition = dataTypesDefinition;

  associations: { type: ImportDataTypes; paths: string[][] }[];

  constructor(public dialogRef: NbDialogRef<SourceNormalizationJsonComponent>) {
    this.associations = this.dataTypesDefinition.map((dt) => {
      return { type: dt.type, paths: [] };
    });
  }

  form: FormGroup = new FormGroup({
    answer: new FormControl<string>(null, Validators.required),
    sourceRef: new FormControl<string>(null),
    sourceId: new FormControl<string>(null)
  });

  get answer(): FormControl {
    return this.form.get('answer') as FormControl;
  }
  get sourceRef(): FormControl {
    return this.form.get('sourceRef') as FormControl;
  }
  get sourceId(): FormControl {
    return this.form.get('sourceId') as FormControl;
  }

  get canSave(): boolean {
    return this.isSubmitted ? this.form.valid : this.form.dirty;
  }

  isSubmitted;

  submit(): void {
    const data = this.gatherData(this.source.rawData);
    console.log(data);
    // this.isSubmitted = true;
    // if (this.canSave) {
    //   this.gatherData();
    // }
  }

  gatherData(data): [] {
    let reducedData;
    this.dataTypesDefinition.map((dataType) => {
      let gatheredTypeData = this.gatherTypeData(data, dataType.type);

      if (gatheredTypeData) {
        if (!reducedData) {
          reducedData = gatheredTypeData.map((gd) => {
            let obj = {};
            obj[dataType.type] = gd;
            return obj;
          });
        } else {
          gatheredTypeData.forEach((gd, index) => {
            reducedData[index][dataType.type] = gd;
          });
        }
      }
    });

    return reducedData;
  }

  gatherTypeData(data, type: ImportDataTypes): [] {
    const answerType = this.associations.find((a) => a.type === type);
    let previousWalk;
    answerType.paths.forEach((path) => {
      let walk = this.walk(data, path);
      console.log(walk);
      if (previousWalk) {
        walk.forEach((line, index) => {
          previousWalk[index] = previousWalk[index] + ' ' + line;
        });
      } else {
        previousWalk = walk;
      }
    });

    return previousWalk;
  }

  walk(data, path: string[], pathindex: number = 0): any {
    if (isPrimitive(data)) return data;

    const space = path[pathindex];
    if (data[space]) {
      const pointer = data[space];
      if (Array.isArray(pointer)) {
        return pointer.map((line) => {
          return this.walk(line, path, pathindex + 1);
        });
      } else {
        return pointer;
      }
    } else {
      console.log('!!!!!!!!!!!!!!!!!ca va pas');
    }
  }

  upriseSelection(info: { dataType: ImportDataTypes; path: string[] }): void {
    const includesArray = (data, arr) => {
      return data.some((e) => Array.isArray(e) && e.every((o, i) => Object.is(arr[i], o)));
    };

    const type = this.associations.find((a) => a.type === info.dataType);
    if (!includesArray(type.paths, info.path)) type.paths.push(info.path);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
