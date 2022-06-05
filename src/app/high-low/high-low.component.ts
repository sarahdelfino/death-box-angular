import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Inject, OnInit, Input, SimpleChanges, OnDestroy } from '@angular/core';
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
      transition("default => flipped", [animate('500ms',)]),
      transition("flipped => default", [animate("400ms")]),
    ]),
    trigger('fadeViewIn', [
      transition(":enter", [
        style({ opacity: 0 }),
        animate('4s', style({ opacity: 1 }))]),
    ]),
    trigger('fadeViewOut', [
      transition(":leave", [
        style({ opacity: 1 }),
        animate('2s 3s', style({ opacity: 0 }))]),
    ]),
  ]
})

export class HighLowComponent implements OnInit, OnDestroy {

  public card: Card;
  public choice: string;
  newCard: Card;
  data: CardData = {
    imageId: "",
    state: "default"
  };
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


  constructor(
    public dialogRef: MatDialogRef<HighLowComponent>,
    private gameService: GameService,
    private db: DatabaseService,
    @Inject(MAT_DIALOG_DATA) data) {
    this.card = data.data.crd[0];
    this.newCard = data.data.newCrd;
    this.stackLength = data.data.ln;
    this.count = this.stackLength;
    this.gameId = data.data.gameId;
    this.players = data.data.curP;
    if (parseInt(this.card.value) <= 10 && parseInt(this.card.value) >= 2) {
      this.title = `Higher or lower than ${this.card.value}?`;
    } else if (parseInt(this.card.value) == 11) {
      this.title = "Higher or lower than a jack?"
    } else if (parseInt(this.card.value) == 12) {
      this.title = "Higher or lower than a queen?"
    } else if (parseInt(this.card.value) == 13) {
      this.title = "Higher or lower than a king?"
    } else {
      this.title = "Higher or lower than an ace?"
    }
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
          this.dialogRef.close(data);
        }, 1000);
      }
    })
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    // end counting & delete seconds
    this.db.endCounting(this.gameId);
    this.subscription.unsubscribe();
  }

  cardFlip() {
    if (this.data.state === "default") {
      this.data.state = "flipped";
    } else {
      this.data.state = "default";
    }
  }

  flipEnd() {
      let compare = this.gameService.compare(this.choice, this.card.value, this.newCard.value);
      let data = {crd: this.card, newCrd: this.newCard, comp: compare, ln: this.stackLength};
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
        console.log("SECONDS: ", seconds);
        console.log("new: ", this.count);
        let newSeconds = seconds + this.count;
        console.log(this.gameId, this.players[i].name, newSeconds);
        this.db.updatePlayerSeconds(this.gameId, this.players[i].name, newSeconds);
        if (this.count == 0) {
          let timer = setTimeout(() => {
            this.dialogRef.close(data);
          }, 1000);
        }
      } else {
        this.title = "Correct!";
        let timer = setTimeout(() => {
          this.dialogRef.close(data);
        }, 1000);
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
    console.log(this.data);
    this.choice = choice;
    document.getElementById("scene").addEventListener("transitionend", function (e) {
      e.preventDefault();
    });
    this.flipEnd();
    this.arrowClick = true;
  }

  higher() {
    this.choice = "higher";
    this.cardFlip();
  }

  lower() {
    this.choice = "lower";
    this.cardFlip();
  }
}
