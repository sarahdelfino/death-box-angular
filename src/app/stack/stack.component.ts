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
  
  @Input()
  public cards: any = [];
  
  @Output()
  private clickedCardEmitter: EventEmitter<Card> = new EventEmitter();

  constructor(private _gameService: GameService) { }

  ngOnInit() {
    // this.cards.push(this.deck.pop());
    console.log("Cards: ", this.cards);
  }

  public add(card: Card) {
    this.cards.splice(0, 0, card);
  }

  onCardClick() {
    this.clickedCardEmitter.emit(this.cards[0].cardName);
  }

}
