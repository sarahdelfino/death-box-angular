import { Component, ElementRef, Input, OnInit, AfterViewInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { DatabaseService } from '../database.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {

  @ViewChild('scroll', { static: true }) scroll: any;
  @ViewChildren('messageList') messageList: QueryList<ElementRef>

  @Input()
  public gameId: string;
  sendMessageForm: UntypedFormGroup;
  // messages: Array<Message>;
  // messages = new Message(this.gameId);
  messages: any;

  constructor(private formBuilder: UntypedFormBuilder,
    protected $gaService: GoogleAnalyticsService,
    private dbService: DatabaseService) { 
      this.createForm();
    }

  public user: string;

  ngOnInit(): void {
    this.user = sessionStorage.getItem('player');
    this.dbService.getMessages(this.gameId).valueChanges().subscribe(messages => {
      let tmp = [];
      tmp = Object.keys(messages)
      this.messages = messages;
      this.messageList.changes.subscribe((r) => {
        this.scrollToBottom(tmp[tmp.length - 1]);
      });
    });
  }

  createForm(): void {
    this.sendMessageForm = this.formBuilder.group({
      message: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  sendMessage(sendMessageFormData: string) {
    if (this.sendMessageForm.invalid) {
      return;
    } else {
    this.sendMessageForm.reset()
    let date = new Date();
    let formatted = date.toISOString();
    formatted = formatted.replace(/[\.][0-9]*\w/g, '')
    this.dbService.sendMessage(this.gameId, formatted, this.user, sendMessageFormData['message']);
    }
  }

  scrollToBottom(id: string) {
    document.getElementById(id).scrollIntoView();
  }

}
