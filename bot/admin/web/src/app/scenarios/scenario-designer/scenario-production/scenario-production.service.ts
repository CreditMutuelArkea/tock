import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ScenarioStateGroupComponent } from './state-group/state-group.component';
import { ScenarioTransitionComponent } from './state-group/transition/transition.component';

@Injectable({
  providedIn: 'root'
})
export class ScenarioProductionService {
  public scenarioProductionItemsCommunication = new Subject<any>();
  public scenarioProductionTransitionsComponents: ScenarioTransitionComponent[] = [];
  public scenarioProductionStateComponents: { [key: string]: ScenarioStateGroupComponent } = {};

  unRegisterTransitionComponent(name: string) {
    this.scenarioProductionTransitionsComponents = this.scenarioProductionTransitionsComponents.filter(
      (entry) => entry.transition.name !== name
    );
  }
  registerTransitionComponent(component: ScenarioTransitionComponent) {
    this.scenarioProductionTransitionsComponents.push(component);
  }

  unRegisterStateComponent(name: string) {
    delete this.scenarioProductionStateComponents[name];
  }
  registerStateComponent(component: ScenarioStateGroupComponent) {
    this.scenarioProductionStateComponents[component.state.id] = component;
  }

  redrawPaths() {
    this.scenarioProductionItemsCommunication.next({
      type: 'redrawPaths'
    });
  }
  redrawActions() {
    this.scenarioProductionItemsCommunication.next({
      type: 'redrawActions'
    });
  }
  redrawIntents() {
    this.scenarioProductionItemsCommunication.next({
      type: 'redrawIntents'
    });
  }
  updateLayout() {
    setTimeout(() => {
      this.redrawActions();
      setTimeout(() => {
        this.redrawIntents();
        setTimeout(() => {
          this.redrawPaths();
        });
      });
    });
  }

  itemDropped(stateId: string, dropped: object): void {
    this.scenarioProductionItemsCommunication.next({
      type: 'itemDropped',
      stateId: stateId,
      dropped: dropped
    });
  }

  addStateGroup(stateId: string, groupName: string): void {
    this.scenarioProductionItemsCommunication.next({
      type: 'addStateGroup',
      stateId: stateId,
      groupName: groupName
    });
  }
  removeState(stateId: string): void {
    this.scenarioProductionItemsCommunication.next({
      type: 'removeState',
      stateId: stateId
    });
  }
}
