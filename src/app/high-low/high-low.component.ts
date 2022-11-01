import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Inject, OnInit, AfterViewInit, Input, SimpleChanges, OnDestroy, Output, EventEmitter } from '@angular/core';
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
})

export class HighLowComponent implements OnInit, OnDestroy {

  @Input() public cardsInfo: any = []
  @Output() isFinished = new EventEmitter<boolean>();

  public card: Card;
  public choice: string;
  public revealCount = false;
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
  arrowClicked = false;
  cardSelected: boolean;
  hideImages = false;
  // arrowClick: boolean;

  constructor(
    private gameService: GameService,
    private db: DatabaseService) {
    //     console.log(data);
    // this.card = data.data.crd[0];
    // this.newCard = data.data.newCrd;
    // this.stackLength = data.data.ln;
    // this.count = this.stackLength;
    // this.gameId = data.data.gameId;
    // this.players = data.data.curP;
    // this.choice = data.data.c;

    // this.subscription = this.db.getGame(this.gameId).valueChanges().subscribe(c => {
    //   this.uiCounter = c.seconds;
    //   if (this.uiCounter == 1) {
    //     this.text = "second";
    //   } else {
    //     this.text = "seconds";
    //   }
    //   if (this.uiCounter == 0) {
    //     let timer = setTimeout(() => {
    //       let data = {crd: this.card, newCrd: this.newCard, ln: this.stackLength};
    //       this.dialogRef.close(data);
    //     }, 1500);
    //   }
    // })

  }

  ngOnInit() {
    console.log(this.cardsInfo);
    this.card = this.cardsInfo.clickedCard;
    this.newCard = this.cardsInfo.newCard;
    this.stackLength = this.cardsInfo.stackLength;
    this.count = this.stackLength;
    this.gameId = this.cardsInfo.gameId;
    // this.players = data.data.curP;

    console.log(this.newCard);

    this.subscription = this.db.getGame(this.gameId).valueChanges().subscribe(c => {
      this.uiCounter = c.seconds;
      if (this.uiCounter == 1) {
        this.text = "second";
      } else {
        this.text = "seconds";
      }
      if (this.uiCounter == 0) {
        console.log("zero");
        // this.isFinished.emit(true);
        // let timer = setTimeout(() => {
        //   let data = { crd: this.card, newCrd: this.newCard, ln: this.stackLength };
        // }, 1500);
      }
    })
    let timer = setTimeout(() => {
      this.data.state = 'flipped';
    }, 500);
  }

  ngAfterViewInit() {
    let selected = document.getElementById("selectedImg");
    selected.addEventListener("webkitanimationend", this.endCardMoveAnimation);
    selected.addEventListener("animationend", this.endCardMoveAnimation);
  }

  ngOnDestroy() {
    // end counting & delete seconds
    this.db.endCounting(this.gameId);
    this.subscription.unsubscribe();
  }

  arrowClick(choice: string) {
    this.arrowClicked = true;
    this.cardsInfo['choice'] = choice;
    console.log(this.cardsInfo);
    let compare = this.gameService.compare(choice, this.card.value, this.newCard.value);
    console.log(compare);
    let seconds = 0;
    if (!compare) {
      this.wrongGuess = true;
      this.db.updateCounting(this.gameId);
      this.count = this.stackLength;
      this.db.updateGameSeconds(this.gameId, this.count);
      this.title = 'Drink up!';
      let newSeconds = seconds + this.count;
      console.log(newSeconds);
      // this.isFinished.emit(false);

      // get index of current player
      // let i = this.players.findIndex(i => i.currentPlayer == true);
      // // if current player found..
      // if (i != -1) {
      //   seconds = this.players[i].secondsDrank;
      // } else {
      //   i = 0;
      //   seconds = this.players[i].secondsDrank;
      // }
      // console.log("SECONDS: ", seconds);
      // console.log("new: ", this.count);
       
      // console.log(this.gameId, this.players[i].name, newSeconds);
      // this.db.updatePlayerSeconds(this.gameId, this.players[i].name, newSeconds);
    } else {
      this.title = "Correct!";
      // let timer = setTimeout(() => {
        // this.isFinished.emit(true);
      // }, 1500);
    }
  }

  endCardMoveAnimation() {
    console.log("before: ", this.revealCount);
    console.log("animation ended!");
    this.revealCount = true;
    this.hideImages = true;
    console.log("after: ", this.revealCount);
  }

  finishedAnimations($event) {
    console.log($event);
    if ($event.fromState === 'void' && $event.triggerName === 'fadeViewOut') {
      this.db.updateCounting(this.gameId);
      this.count = this.stackLength;
      this.db.updateGameSeconds(this.gameId, this.count);
      // this.db.updatePlayerSeconds(this.gameId, this.players, this.count);
    }
  }

}
