import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RagMonitoringService {
  public communication = new Subject<any>();
  documentClick(event: MouseEvent): void {
    this.communication.next({
      type: 'documentClick',
      event
    });
  }
}
