import { Component, EventEmitter, Input, Output } from '@angular/core';
import { isPrimitive } from '../../../../../shared/utils';
import { dataTypesDefinition, ImportDataTypes } from '../../../../models';

@Component({
  selector: 'tock-json-iterator',
  templateUrl: './json-iterator.component.html',
  styleUrls: ['./json-iterator.component.scss']
})
export class JsonIteratorComponent {
  @Input() recursiveList: any;
  @Input() isRoot: boolean = true;

  @Input() parentKey: string;
  @Output() riseSelection = new EventEmitter();

  dataTypesDefinition = dataTypesDefinition;

  isPrimitive = isPrimitive;

  isArray(arg: any): boolean {
    return Array.isArray(arg);
  }

  selectDataType(dataType: ImportDataTypes, key: string): void {
    let keyOrParentKey = key;
    if (Array.isArray(this.recursiveList)) {
      keyOrParentKey = this.parentKey;
    }
    this.riseSelection.emit({
      dataType,
      path: [keyOrParentKey]
    });
  }

  upriseSelection(info: { dataType: ImportDataTypes; path: string[] }): void {
    if (Array.isArray(this.recursiveList)) {
      info.path.unshift(this.parentKey);
    }
    this.riseSelection.emit(info);
  }
}
