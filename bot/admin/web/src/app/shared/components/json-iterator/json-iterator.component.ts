import { Component, Input } from '@angular/core';
import { isPrimitive } from '../../utils';

@Component({
  selector: 'tock-json-iterator',
  templateUrl: './json-iterator.component.html',
  styleUrls: ['./json-iterator.component.scss']
})
export class JsonIteratorComponent {
  @Input() data: any;
  @Input() isRoot: boolean = true;
  @Input() parentKey: string;

  isDeployed: boolean = false;

  isPrimitive = isPrimitive;

  switchDeployed() {
    this.isDeployed = !this.isDeployed;
  }
}
