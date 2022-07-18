import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ScenarioProductionService } from '../../scenario-production.service';

@Component({
  selector: 'scenario-transition',
  templateUrl: './transition.component.html',
  styleUrls: ['./transition.component.scss']
})
export class ScenarioTransitionComponent implements OnDestroy {
  destroy = new Subject();
  @Output() removeTransition = new EventEmitter();
  @Input() transition;
  @Input() parentState;

  constructor(
    public elementRef: ElementRef,
    private scenarioProductionService: ScenarioProductionService
  ) {
    this.scenarioProductionService.scenarioProductionItemsCommunication
      .pipe(takeUntil(this.destroy))
      .subscribe((evt) => {
        if (evt.type == 'redrawIntents') {
          this.setTransitionTop();
        }
      });
  }

  ngAfterViewInit(): void {
    this.scenarioProductionService.registerTransitionComponent(this);
    setTimeout(() => {
      this.setTransitionTop();
    });
  }

  setTransitionTop() {
    this.elementRef.nativeElement.style.top = this.getTransitionTop() + 'px';
  }

  getTransitionTop() {
    const stateComponent =
      this.scenarioProductionService.scenarioProductionStateComponents[this.transition.target];
    const transitionComponent =
      this.scenarioProductionService.scenarioProductionTransitionsComponents[this.transition.name];
    if (stateComponent && transitionComponent) {
      const stateElem = stateComponent.elementRef.nativeElement;
      const transitionElem = transitionComponent.elementRef.nativeElement;
      let averageHeight = transitionElem.offsetHeight;

      let siblings = [];
      let i, index;
      i = index = 0;

      for (let sibling in this.parentState.on) {
        if (this.parentState.on[sibling] === this.transition.target) {
          if (sibling == this.transition.name) {
            index = i;
          } else {
            siblings.push(sibling);
          }
          i++;
        }
      }

      let totalHeight = averageHeight;
      let margin = 0;
      if (siblings.length) {
        margin = 5;
        totalHeight = (totalHeight + margin) * i;
      }

      return (
        stateElem.offsetTop +
        stateElem.offsetHeight / 2 -
        totalHeight / 2 +
        averageHeight * index +
        (index ? margin * index : 0)
      );
    }
    return 0;
  }

  remove(transition) {
    this.removeTransition.emit(transition);
  }

  ngOnDestroy(): void {
    this.scenarioProductionService.unRegisterTransitionComponent(this.transition.name);
    this.destroy.next();
    this.destroy.complete();
  }
}
