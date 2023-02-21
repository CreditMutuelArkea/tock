import { Subject } from 'rxjs';

export class StateServiceMock {
  currentApplication = {
    namespace: 'namespace/test',
    name: 'test',
    _id: '1'
  };

  currentLocal = 'fr';

  configurationChange = new Subject();

  intentIdExistsInOtherApplication() {
    return false;
  }
}
