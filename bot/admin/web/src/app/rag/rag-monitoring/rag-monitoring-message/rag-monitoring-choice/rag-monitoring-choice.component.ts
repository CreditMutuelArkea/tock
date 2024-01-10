import { Component, Input } from '@angular/core';
import { Choice } from '../../../../shared/model/dialog-data';

@Component({
  selector: 'tock-rag-monitoring-choice',
  templateUrl: './rag-monitoring-choice.component.html',
  styleUrls: ['./rag-monitoring-choice.component.scss']
})
export class RagMonitoringChoiceComponent {

  @Input() choice: Choice;

  title(): String {
    return this.choice.parameters.get('_title');
  }

  url(): String {
    return this.choice.parameters.get('_url');
  }

  parameters(): string {
    if (this.choice.parameters.size === 0) {
      return '';
    }
    let r = '';
    const separator = ' & ';
    if (this.title() && !this.url()) {
      r += 'intent = ' + this.choice.intentName + separator;
    }
    this.choice.parameters.forEach((v, k) => {
      if (k !== '_title') r += k + ' = ' + v + separator;
    });
    if (r.endsWith(separator)) {
      r = r.substring(0, r.length - separator.length);
    }
    return r.trim();
  }

}
