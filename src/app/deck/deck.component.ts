import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit, SimpleChanges, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Card } from '../card/card';
import { DatabaseService } from '../database.service';
import { GameService } from '../game.service';

export interface CardData {
  imageId: string;
  state: "default" | "flipped" | "moved";
}

@Component({
  selector: 'app-deck',
  templateUrl: './deck.component.html',
  styleUrls: ['./deck.component.css'],
  animations: [
    trigger('cardFlip', [
      state('flipped', style({
        transform: 'translateX(-150px) rotateY(180deg)'
      })),
      state('void', style({
        transform: 'translateX(0px)'
      })),
      transition(':enter', [
        animate('.25s ease-in')
      ]),
      transition(':leave', [
        animate('.25s .25s ease-out')
      ]),
    ]),
  ],
})
export class DeckComponent implements OnInit, OnDestroy {
  @Input()
  public card: Card;

  @Input()
  public clickData: any;

  public choice: string;
  title: string;
  isWrongGuess: boolean;
  uiCounter: number;
  text: string;
  subscription: Subscription;
  gameId: string;
  stackLength: number;

  data: CardData = {
    imageId: "",
    state: "default"
  };

  deckCount: number;
  changeLog = [];

  constructor(private gameService: GameService,
    private db: DatabaseService) { }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    if (this.clickData && changes.clickData.currentValue !== undefined) {
      console.log(this.clickData);
      this.gameId = this.clickData.gameId;
      this.choice = this.clickData.c;
      this.stackLength = this.clickData.ln;
      document.getElementById("scene").addEventListener("transitionend", function (e) {
        e.preventDefault();
      });
      this.flipEnd();
      this.subscription = this.db.getGame(this.gameId).valueChanges().subscribe(c => {
        this.uiCounter = c.seconds;
        if (this.uiCounter == 1) {
          this.text = "second";
        } else {
          this.text = "seconds";
        }
        // if (this.uiCounter == 0) {
        //   let timer = setTimeout(() => {
        //     let outboundData = { crd: this.card, newCrd: this.newCard, ln: this.stackLength };
        //   }, 1000);
        // }
      })
    }
  }

    ngOnDestroy() {
      // end counting & delete seconds
      this.db.endCounting(this.gameId);
      this.subscription.unsubscribe();
    }

  ngOnInit(): void {
    // console.log(this.clickData);
      // this.deckCount = this.game.getDeckLength();
      // if(this.card == null) {
      //   this.card = new Card("undefined", "undefined");
      // }
  }

  flipEnd() {
    let compare = this.gameService.compare(this.choice, this.clickData.crd[0].value, this.clickData.newCrd.value);
    // let data = { crd: this.card, newCrd: this.newCard, comp: compare, ln: this.stackLength };
    console.log(compare);
    let seconds = 0;
    if (!compare) {
      this.isWrongGuess = true;
      this.db.updateGameSeconds(this.gameId, this.stackLength);
      // get index of current player
      // let i = this.players.findIndex(i => i.currentPlayer == true);
      // if current player found..
      // if (i != -1) {
      //   seconds = this.players[i].secondsDrank;
      // } else {
      //   i = 0;
      //   seconds = this.players[i].secondsDrank;
      // }
      // console.log("SECONDS: ", seconds);
      // console.log("new: ", this.count);
      // let newSeconds = seconds + this.count;
      // console.log(this.gameId, this.players[i].name, newSeconds);
      // this.db.updatePlayerSeconds(this.gameId, this.players[i].name, newSeconds);
      // if (this.count == 0) {
      //   console.log(data);
      // }
    } else {
      this.title = '';
      this.title = "Correct!";
    //   let timer = setTimeout(() => {
    //     this.isFinished.emit(false);
    //   }, 1000);
    }
  }


  cardFlip() {
    // if (this.data.state === "default") {
    //   this.data.state = "flipped";
    // } else {
    //   this.data.state = "moved";
    // }
  }

}
