import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { stringify } from 'querystring';
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
  stackVisibility = false;
  choice: string;

  @Input()
  public cards: any = [];

  @Output()
  private clickedCardEmitter: EventEmitter<Card> = new EventEmitter();
  
  @Output() public cardChoiceEmitter: EventEmitter<string> = new EventEmitter();

  constructor(private _gameService: GameService) { }

  ngOnInit() {

  }

  public add(card: Card) {
    this.cards.splice(0, 0, card);
  }

  onCardClick(stack: Card) {
    this.selectedStack = stack;
    this.clickedCardEmitter.emit(this.cards[0].cardName);
  }

  enableArrowVisibility() {
    this.stackVisibility = true;
  }

  disableArrowVisibility($event) {
    if (!$event.relatedTarget.className || $event.relatedTarget.className !== 'arrow') {
      this.stackVisibility = false;
    }
  }

  arrowClick(choice: string) {
    // console.log(choice);
    this.choice = choice;
    this.cardChoiceEmitter.emit(this.choice);
  }

}
