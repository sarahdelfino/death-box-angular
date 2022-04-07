import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { DECK } from '../deck';
// import { Deck } from '../deck';
import { Card } from './card';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  // deck = DECK;
  // public deck = Deck;
  public selectedIndex = false;

  @Input()
  public card: Card;

  @Output()
  private clickedCardEmitter: EventEmitter<Card> = new EventEmitter();
  constructor() { }
  ngOnInit() {
    if(this.card == null) { 
      this.card = new Card('undefined', 'undefined');
    }
  }

  onCardClick() {
    this.clickedCardEmitter.emit(this.card);
  }

}
