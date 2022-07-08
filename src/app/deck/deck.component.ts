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
]
})
export class DeckComponent implements OnInit {
  @Input()
  public card: Card;

  @Input()
  public clickData: any;

  @Output() endCompareEmitter: EventEmitter<any> = new EventEmitter();

  public choice: string;
  title: string;
  isWrongGuess: boolean;
  uiCounter: number;
  text: string;
  subscription: Subscription;
  gameId: string;
  stackLength: number;
  position;
  phaseName;

  data: CardData = {
    imageId: "",
    state: "default"
  };

  deckCount: number;
  changeLog = [];

  constructor(private gameService: GameService,
    private db: DatabaseService) { }

  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes);
    if (this.clickData && changes.clickData.currentValue !== undefined) {
      console.log(this.clickData);
      this.gameId = this.clickData.gameId;
      this.choice = this.clickData.c;
      this.stackLength = this.clickData.ln;
    }
  }

  ngOnInit(): void {
    // console.log(this.clickData);
      // this.deckCount = this.game.getDeckLength();
      // if(this.card == null) {
      //   this.card = new Card("undefined", "undefined");
      // }
  }

  flipEnd() {
    if (this.clickData) {
    let compare = this.gameService.compare(this.clickData.c, this.clickData.crd[0].value, this.clickData.newCrd.value);
    let data = { stackCard: this.clickData.crd, newCard: this.clickData.newCrd, comp: compare, ln: this.clickData.ln };
    this.endCompareEmitter.emit(data);
    let seconds = 0;
    if (!compare) {
      this.isWrongGuess = true;
      // this.db.updateGameSeconds(this.gameId, this.stackLength);
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
      let timer = setTimeout(() => {
        this.title = '';
        this.clickData = null;
      }, 1500);
    } else {
      let timer = setTimeout(() => {
        this.title = '';
        this.clickData = null;
      }, 1500);
    }
  }
}

}
