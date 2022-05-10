import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AnswerContainer, TickAnswerConfiguration } from '../model/story';
import { BotService } from '../bot-service';
import { CustomsValidators } from '../../shared/validators/customsValidators.validators';
import { FilterOption, Group } from '../../search/filter/search-filter.component';
import { StateService } from '../../core-nlp/state.service';

enum IntentType {
  MAIN = 'main',
  SECOND = 'second'
}

@Component({
  selector: 'tock-tick-answer',
  templateUrl: './tick-answer.component.html',
  styleUrls: ['./tick-answer.component.css']
})
export class TickAnswerComponent implements OnInit, OnDestroy {
  @Input()
  container: AnswerContainer;

  @Input()
  answerLabel: string = 'Answer';

  private answer: TickAnswerConfiguration;
  private currentWebhookURL: string = '';
  private subscriptions = new Subscription();

  public botActions?: string[];
  public intentGroups: Group[] = [];
  public intentList: typeof IntentType = IntentType;

  public form = new FormGroup({
    otherStarterIntents: new FormControl([]),
    secondaryIntents: new FormControl([]),
    webhookURL: new FormControl(null, [Validators.required, CustomsValidators.url]),
    stateMachine: new FormControl(null, Validators.required)
  });

  public loading = {
    botActions: false
  };

  get otherStarterIntents(): FormControl {
    return this.form.get('otherStarterIntents') as FormControl;
  }

  get secondaryIntents(): FormControl {
    return this.form.get('secondaryIntents') as FormControl;
  }

  get webhookURL(): FormControl {
    return this.form.get('webhookURL') as FormControl;
  }

  get stateMachine(): FormControl {
    return this.form.get('stateMachine') as FormControl;
  }

  constructor(private botService: BotService, private stateService: StateService) {}

  ngOnInit(): void {
    this.buildIntentGroups();
    this.answer = this.container.tickAnswer();

    this.initForm();

    this.subscriptions.add(
      this.form.valueChanges.subscribe((values) => {
        this.answer.otherStarterIntents = values.otherStarterIntents.map((str, index) => ({ name: str}))
        this.answer.secondaryIntents = values.secondaryIntents.map((str, index) => ({ name: str}))
        this.answer.webhookURL = values.webhookURL;
        this.answer.stateMachine = values.stateMachine;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  initForm(): void {
    this.form.setValue({
      otherStarterIntents: this.answer.otherStarterIntents.map(i => i.name),
      secondaryIntents: this.answer.secondaryIntents.map(i => i.name),
      webhookURL: this.answer.webhookURL,
      stateMachine: null
    });
  }

  buildIntentGroups(): void {
    const currentIntentsCategories = this.stateService.currentIntentsCategories.getValue();
    this.intentGroups = currentIntentsCategories.map(
      (entry) =>
        new Group(
          entry.category,
          entry.intents.map((intent) => new FilterOption(intent.name, intent.intentLabel()))
        )
    );
  }

  disabledIntent(intent: string, list: IntentType.MAIN | IntentType.SECOND): boolean {
    if (list === this.intentList.MAIN) {
      return this.otherStarterIntents.value.includes(intent);
    } else if (list === this.intentList.SECOND) {
      return this.secondaryIntents.value.includes(intent);
    }
  }

  visualizeBotActions(): void {
    if (this.currentWebhookURL !== this.webhookURL.value) {
      const tmp = [
        'Bot action 1',
        'Bot action 2',
        'Bot action 3',
        'Bot action 4',
        'Bot action 5',
        'Bot action 1',
        'Bot action 2',
        'Bot action 3',
        'Bot action 4',
        'Bot action 5'
      ];

      this.botActions = undefined;
      this.currentWebhookURL = this.webhookURL.value;
      this.loading.botActions = true;

      setTimeout(() => {
        this.botActions = [...tmp];
        this.loading.botActions = false;
      }, 1500);

      /*
      this.subscriptions.add(
        this.botService.getBotActions(url).subscribe({
          next: (botActions) => {
            this.botActions = botActions;
            this.loading.botActions = false;
          },
          error: () => {
            this.loading.botActions = false;
          }
        })
      );*/
    }
  }
}
