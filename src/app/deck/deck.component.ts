import { animate, keyframes, query, sequence, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit, SimpleChanges, Output, EventEmitter } from '@angular/core';
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
        transform: 'translateX(-100px) rotateY(180deg)',
      })),
      transition(':enter', [
        animate('500ms ease-in')
      ]),
      transition('* => flipped', [
        animate('500ms')
      ]),
    ]),
    trigger('compareText', [
      transition(":enter", [
        style({ opacity: 0 }),
        animate('.25s ease-in', style({ opacity: 1 }))]),
      transition(":leave", [
        style({ opacity: 1 }),
        animate('.25s ease-out', style({ opacity: 0 }))]),
    ]),
    trigger('card', [
      transition(":enter", [
        style({ opacity: 0 }),
        animate('.25s ease-in', style({ opacity: 1 }))]),
      transition(":leave", [
        style({ opacity: 1 }),
        animate('.25s ease-out', style({ opacity: 0 }))]),
    ]),
  ]
})
export class DeckComponent implements OnInit {
  @Input()
  public card: Card;

  @Input()
  public clickData: any;

  // @Input()
  // public text: string;

  @Output() endCompareEmitter: EventEmitter<any> = new EventEmitter();

  // @Output() isFinished = new EventEmitter<boolean>();

  public choice: string;
  title: string;
  wrongGuess: boolean;
  @Input() public uiCounter: number;
  // uiCounter: any;
  text: string;
  subscription: Subscription;
  gameId: string;
  stackLength: number;
  position;
  phaseName;
  seconds: number;
  secondText: string;

  data: CardData = {
    imageId: "",
    state: "default"
  };

  deckCount: number;
  changeLog = [];

  constructor(private gameService: GameService,
    private db: DatabaseService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    console.log(this.clickData);
    // console.log(this.text);
    let test = [];
    console.log("CHANGES COUNTER: " + this.uiCounter);
    if (this.uiCounter == 1) {
      this.secondText = "second";
    } else {
      this.secondText = "seconds";
    }
    if (this.clickData && changes.clickData.currentValue !== undefined) {
      console.log(this.clickData);
      this.gameId = this.clickData.gameId;
      this.choice = this.clickData.c;
      this.stackLength = this.clickData.ln;
      // this.uiCounter == this.stackLength;
    }
    // if (this.text) {

    // }
  }

  ngOnInit(): void {
    console.log("INIT COUNTER: " + this.uiCounter);
    // console.log(this.clickData);
    // this.deckCount = this.game.getDeckLength();
    // if(this.card == null) {
    //   this.card = new Card("undefined", "undefined");
    // }
    // this.db.getGame(this.gameId).valueChanges().subscribe(gameData => {
    //   if (gameData.seconds) {
    //     this.seconds = gameData.seconds;
    //   }
    // });
    // if (this.seconds != 1) {
    //   this.secText = 'seconds';
    // } else {
    //   this.secText = 'second';
    // }
    // this.db.getGame(this.gameId).valueChanges().subscribe(c => {
    //   console.log(c);
    //   if (c.seconds) {
    //     this.uiCounter = c.seconds;
    //   }
    // });
    // if (this.uiCounter == 1) {
    //   this.secondText = "second";
    // } else {
    //   this.secondText = "seconds";
    // }
    // if (this.uiCounter == 0) {
    //   let timer = setTimeout(() => {
    //     console.log("done");
    //   }, 1500);
    // }
  }

  flipEnd() {
    if (this.clickData) {
      let compare = this.gameService.compare(this.clickData.c, this.clickData.crd[0].value, this.clickData.newCrd.value);
      let data = { stackCard: this.clickData.crd, newCard: this.clickData.newCrd, comp: compare, ln: this.clickData.ln };
      this.endCompareEmitter.emit(data);
      if (!compare) {
        this.wrongGuess = true;
        this.db.updateGameSeconds(this.gameId, this.stackLength);
      } else {
        this.title = "Correct!";
        let timer = setTimeout(() => {
          // this.isFinished.emit(false);
          this.title = '';
          this.clickData = null;
        }, 1500);
      }
    }
  }

}
