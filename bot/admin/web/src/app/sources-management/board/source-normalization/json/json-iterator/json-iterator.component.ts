import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { deepCopy, includesArray, isPrimitive } from '../../../../../shared/utils';
import { dataTypesDefinition, ImportDataTypes } from '../../../../models';
import { JsonImportAssociation } from '../source-normalization-json.component';

@Component({
  selector: 'tock-json-iterator',
  templateUrl: './json-iterator.component.html',
  styleUrls: ['./json-iterator.component.scss']
})
export class JsonIteratorComponent implements OnInit {
  @Input() recursiveList: any;
  @Input() isRoot: boolean = true;
  @Input() associations: JsonImportAssociation[];
  @Input() parentKey: string;
  @Input() parentType: string;
  @Input() upstreamPath: string[] = [];
  path: string[] = [];

  @Output() riseSelection = new EventEmitter();

  dataTypesDefinition = dataTypesDefinition;

  ngOnInit() {
    this.path = deepCopy(this.upstreamPath);
    if (this.parentKey && this.parentType !== 'array') this.path.push(this.parentKey);
  }

  isPrimitive = isPrimitive;

  isArray(arg: any): boolean {
    return arg && Array.isArray(arg);
  }

  isObject(arg: any): boolean {
    return arg && typeof arg === 'object' && !Array.isArray(arg);
  }

  truncatedDataLengthAlert;

  getSampleData() {
    if (this.isArray(this.recursiveList) && this.recursiveList.length > 5) {
      this.truncatedDataLengthAlert = this.recursiveList.length;
      return this.recursiveList.slice(0, 5);
    }
    return this.recursiveList;
  }

  getType(arg: any) {
    if (this.isPrimitive(arg)) return 'primitive';
    if (this.isArray(arg)) return 'array';
    return 'object';
  }

  isSelected(key: string) {
    let leafPath = deepCopy(this.path);
    leafPath.push(key);
    for (let i = 0; i < this.associations.length; i++) {
      if (includesArray(this.associations[i].paths, leafPath)) {
        return this.associations[i].type;
      }
    }
    return null;
  }

  selectDataType(dataType: ImportDataTypes, key: string): void {
    let path = deepCopy(this.path);
    path.push(key);

    this.riseSelection.emit({
      dataType,
      path: path
    });
  }

  upriseSelection(info: { dataType: ImportDataTypes; path: string[] }): void {
    this.riseSelection.emit(info);
  }
}
