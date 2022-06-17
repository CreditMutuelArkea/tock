import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'tock-chat-ui-message',
  templateUrl: './chat-ui-message.component.html',
  styleUrls: ['./chat-ui-message.component.scss']
})
export class ChatUiMessageComponent implements OnInit {
  @Input() message;

  constructor() {}

  ngOnInit(): void {}
}
