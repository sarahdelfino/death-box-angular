import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Inject, OnInit, AfterViewInit, Input, SimpleChanges, OnDestroy, Output, EventEmitter } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Card } from '../card/card';
import { DatabaseService } from '../database.service';
import { GameService } from '../game.service';

export interface CardData {
  imageId: string;
  state: "default" | "flipped";
}

@Component({
  selector: 'app-high-low',
  templateUrl: './high-low.component.html',
  styleUrls: ['./high-low.component.css'],
  animations: [
    trigger("cardFlip", [
      state(
        "default",
        style({
          transform: "none"
        })
      ),
      state(
        "flipped",
        style({
          transform: "rotateY(180deg) translate(-150px, 0px)",
        })
      ),
      transition("default => flipped", [animate('500ms .5s',)]),
      transition("flipped => default", [animate("400ms")]),
    ]),
    trigger('fadeViewIn', [
      transition(":enter", [
        style({ opacity: 0 }),
        animate('.5s', style({ opacity: 1 }))]),
    ]),
    trigger('fadeViewOut', [
      transition(":leave", [
        style({ opacity: 1 }),
        animate('2s 3s', style({ opacity: 0 }))]),
    ]),
  ]
})

export class HighLowComponent implements OnInit, OnDestroy {

  @Output() isFinished = new EventEmitter<boolean>();

  public card: Card;
  public choice: string;
  newCard: Card;
  // @Input() data: any;
  data: CardData = {
    imageId: "",
    state: "default"
  };

  cardNum: string;
  title: string;
  stackLength: number;
  count: number;
  wrongGuess: boolean;
  text = '';
  gameId: string;
  subscription: Subscription;
  uiCounter: number;
  players: any = [];
  arrowClick: boolean;
  @Input() cData;

  constructor(
    private gameService: GameService,
    private db: DatabaseService,) {
    // this.card = this.cData.data.crd[0];
    // this.newCard = this.cData.data.newCrd;
    // this.stackLength = this.cData.data.ln;
    // this.count = this.stackLength;
    // this.gameId = this.cData.data.gameId;
    // this.players = this.cData.data.curP;
    // this.choice = this.cData.data.c;

    this.subscription = this.db.getGame(this.gameId).valueChanges().subscribe(c => {
      this.uiCounter = c.seconds;
      if (this.uiCounter == 1) {
        this.text = "second";
      } else {
        this.text = "seconds";
      }
      if (this.uiCounter == 0) {
        let timer = setTimeout(() => {
          let data = {crd: this.card, newCrd: this.newCard, ln: this.stackLength};
        }, 1500);
      }
    })

  }

  ngOnInit() {
    let timer = setTimeout(() => {
      this.data.state = 'flipped';
    }, 500);
    console.log(this.cData);
  }

  ngAfterViewInit() {
    
  }

  ngOnDestroy() {
    // end counting & delete seconds
    this.db.endCounting(this.gameId);
    this.subscription.unsubscribe();
  }

  flipEnd($event) {
    if ($event.fromState != 'void' && $event.toState != 'void') {
    let compare = this.gameService.compare(this.choice, this.card.value, this.newCard.value);
    let data = { crd: this.card, newCrd: this.newCard, comp: compare, ln: this.stackLength };
    let seconds = 0;
    if (!compare) {
      this.wrongGuess = true;
      this.count = this.stackLength;
      this.db.updateGameSeconds(this.gameId, this.count);
      // get index of current player
      let i = this.players.findIndex(i => i.currentPlayer == true);
      // if current player found..
      if (i != -1) {
        seconds = this.players[i].secondsDrank;
      } else {
        i = 0;
        seconds = this.players[i].secondsDrank;
      }
      let newSeconds = seconds + this.count;
      this.db.updatePlayerSeconds(this.gameId, this.players[i].name, newSeconds);
      if (this.count == 0) {
      }
    } else {
      this.title = "Correct!";
      let timer = setTimeout(() => {
        this.isFinished.emit(false);
      }, 1500);
    }
  }
}

  finishedAnimations($event) {
    if ($event.fromState === 'void' && $event.triggerName === 'fadeViewOut') {
      this.db.updateCounting(this.gameId);
      this.count = this.stackLength;
      this.db.updateGameSeconds(this.gameId, this.count);
      // this.db.updatePlayerSeconds(this.gameId, this.player, this.count);
    }
  }

  arrowChoice(choice: string) {
    this.choice = choice;
    document.getElementById("scene").addEventListener("transitionend", function (e) {
      e.preventDefault();
    });
    this.flipEnd(choice);
    this.arrowClick = true;
  }
}
