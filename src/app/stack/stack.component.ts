import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppComponent } from '../app.component';
import { Card } from '../card/card';
import { GameService } from '../game.service';

@Component({
  selector: 'app-stack',
  templateUrl: './stack.component.html',
  styleUrls: ['./stack.component.css'],
  // providers: [GameService]
  // providers: [AppComponent]
})
export class StackComponent implements OnInit {

  // private deck: Array<Card>;
  // public cards: any = [];
  selectedStack: Card;
  wasClicked = false;

  @Input()
  public cards: any = [];

  @Output()
  private clickedCardEmitter: EventEmitter<Card> = new EventEmitter();

  constructor(private _gameService: GameService) { }

  ngOnInit() {
    // console.log(this.cards);
    // for (let c in this.cards) {
    //   var stack = new Array();
    //   let t = this.cards[c].split('');
    //   let ln = t.length;
    //   console.log(t[ln-1]);
      // stack.push(new Card(this.cards[], this.cards[]))
    // }

  }

  public add(card: Card) {
    this.cards.splice(0, 0, card);
  }

  onCardClick(stack: Card) {
    // this.wasClicked = !this.wasClicked;
    this.selectedStack = stack;
    this.clickedCardEmitter.emit(this.cards[0].cardName);
  }

}
