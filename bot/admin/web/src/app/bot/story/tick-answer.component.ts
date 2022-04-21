import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AnswerContainer, TickAnswerConfiguration } from '../model/story';
import { CustomsValidators } from '../../shared/validators/customsValidators.validators';
import { BotService } from '../bot-service';

enum Intent {
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
  private currentBotActionUrl: string = '';
  private subscriptions = new Subscription();

  public botActions?: string[];
  public intents = ['M_intent_1', 'M_intent_2', 'M_intent_3', 'M_intent_4'];
  public intentList: typeof Intent = Intent;

  public form = new FormGroup({
    mainIntent: new FormControl([]),
    secondIntent: new FormControl([]),
    botActionUrl: new FormControl(null, [Validators.required, CustomsValidators.url]),
    stateMachine: new FormControl(null, Validators.required)
  });

  public loading = {
    botActions: false
  };

  get mainIntent(): FormControl {
    return this.form.get('mainIntent') as FormControl;
  }

  get secondIntent(): FormControl {
    return this.form.get('secondIntent') as FormControl;
  }

  get botActionUrl(): FormControl {
    return this.form.get('botActionUrl') as FormControl;
  }

  get stateMachine(): FormControl {
    return this.form.get('stateMachine') as FormControl;
  }

  constructor(private botService: BotService) {}

  ngOnInit(): void {
    this.answer = this.container.tickAnswer();

    this.initForm();

    console.log('answer', this.answer);

    this.subscriptions.add(
      this.form.valueChanges.subscribe((values) => {
        console.log('values form', values);
        this.answer.tickAnswer.mainIntent = values.mainIntent;
        this.answer.tickAnswer.secondIntent = values.secondIntent;
        this.answer.tickAnswer.botActionUrl = values.botActionUrl;
        this.answer.tickAnswer.stateMachine = values.stateMachine;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  initForm(): void {
    this.form.setValue({
      mainIntent: this.answer.tickAnswer.mainIntent,
      secondIntent: this.answer.tickAnswer.secondIntent,
      botActionUrl: this.answer.tickAnswer.botActionUrl,
      stateMachine: this.answer.tickAnswer.stateMachine
    });
  }

  disabledIntent(intent: string, list: Intent.MAIN | Intent.SECOND): boolean {
    if (list === this.intentList.MAIN) {
      return this.mainIntent.value.includes(intent);
    } else if (list === this.intentList.SECOND) {
      return this.secondIntent.value.includes(intent);
    }
  }

  visualizeBotActions(): void {
    if (this.currentBotActionUrl !== this.botActionUrl.value) {
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
      this.currentBotActionUrl = this.botActionUrl.value;
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
