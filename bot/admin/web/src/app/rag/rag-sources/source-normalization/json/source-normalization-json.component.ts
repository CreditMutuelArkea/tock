import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { includesArray, isPrimitive } from '../../../../shared/utils';
import { dataTypesDefinition, ImportDataTypes, Source, SourceImportParams } from '../../models';

export type JsonImportAssociation = { type: ImportDataTypes; paths: string[][] };

@Component({
  selector: 'tock-source-normalization-json',
  templateUrl: './source-normalization-json.component.html',
  styleUrls: ['./source-normalization-json.component.scss']
})
export class SourceNormalizationJsonComponent {
  @Input() source?: Source;

  @Output() onNormalize = new EventEmitter<SourceImportParams>();

  dataTypesDefinition = dataTypesDefinition;

  associations: JsonImportAssociation[];

  constructor(public dialogRef: NbDialogRef<SourceNormalizationJsonComponent>) {
    this.associations = this.dataTypesDefinition.map((dt) => {
      return { type: dt.type, paths: [] };
    });
  }

  upriseSelection(info: { dataType: ImportDataTypes; path: string[] }): void {
    this.associations.forEach((asso) => {
      if (includesArray(asso.paths, info.path)) {
        asso.paths = asso.paths.filter((path) => {
          return !path.every((o, i) => Object.is(info.path[i], o));
        });
      }
    });

    const type = this.associations.find((a) => a.type === info.dataType);
    if (type) type.paths.push(info.path);
  }

  get canSave(): boolean {
    const type = this.associations.find((a) => a.type === ImportDataTypes.content);
    return type.paths.length > 0;
  }

  invalidFormMessage: string;

  submit(): void {
    this.invalidFormMessage = undefined;
    if (!this.canSave) {
      this.invalidFormMessage = 'Please indicate at least the key corresponding to the "Answer" data type.';
    } else {
      const data = this.gatherData(this.source.rawData);

      const contentPath = this.associations.find((asso) => asso.type === ImportDataTypes.content);
      const sourcePath = this.associations.find((asso) => asso.type === ImportDataTypes.source_ref);

      this.onNormalize.emit({
        content_path: contentPath.paths,
        source_path: sourcePath.paths,
        content: data
      });
    }
  }

  gatherData(data): any {
    let reducedData;
    this.dataTypesDefinition.map((dataType) => {
      let gatheredTypeData = this.gatherDataByType(data, dataType.type);

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

  gatherDataByType(data, type: ImportDataTypes): [] {
    const associationType = this.associations.find((a) => a.type === type);
    let previousWalk;
    associationType.paths.forEach((path) => {
      let walk = this.walk(data, path);
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

  walk(data, path: string[], pathIndex: number = 0): any {
    if (isPrimitive(data)) return data;

    const space = path[pathIndex];
    if (data[space]) {
      const pointer = data[space];
      if (Array.isArray(pointer)) {
        return pointer.map((line) => {
          return this.walk(line, path, pathIndex + 1);
        });
      } else if (isPrimitive(pointer)) {
        return pointer;
      } else {
        return this.walk(pointer, path, pathIndex + 1);
      }
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
