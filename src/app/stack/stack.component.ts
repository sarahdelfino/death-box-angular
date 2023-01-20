import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { Card } from '../card/card';
import { GameService } from '../game.service';

@Component({
  selector: 'app-stack',
  templateUrl: './stack.component.html',
  styleUrls: ['./stack.component.css'],
  animations: [
    trigger('stackAdd', [
      state('added', style({
        //
      })),
      transition('* => added',
      animate('800ms', keyframes([
        style({'box-shadow': 'none', offset: 0}),
        style({'box-shadow': 'rgba(106, 152, 92, 0.4) 5px 5px, rgba(106, 152, 92, 0.3) 10px 10px, rgba(106, 152, 92, 0.2) 15px 15px, rgba(106, 152, 92, 0.1) 20px 20px, rgba(106, 152, 92, 0.05) 25px 25px', offset: 0.4}),
        style({'box-shadow': 'rgba(106, 152, 92, 0.4) 5px 5px, rgba(106, 152, 92, 0.3) 10px 10px, rgba(106, 152, 92, 0.2) 15px 15px, rgba(106, 152, 92, 0.1) 20px 20px, rgba(106, 152, 92, 0.05) 25px 25px', offset: 0.8}),
        style({'box-shadow': 'none', offset: 1.0}),
      ]))),
    ]),
  ]
})
export class StackComponent {
  selectedStack: Card;
  wasClicked = false;
  stackVisibility = false;
  choice: string;
  added: boolean;

  @Input()
  public cards: any = [];

  @Output()
  private clickedCardEmitter: EventEmitter<Card> = new EventEmitter();
  
  @Output() public cardChoiceEmitter: EventEmitter<string> = new EventEmitter();

  constructor(private _gameService: GameService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.cards.currentValue.length > 1) {
      this.added = true;
    }
  }

  public add(card: Card) {
    this.cards.splice(0, 0, card);
  }

  onCardClick(stack: Card) {
    this.selectedStack = stack;
    // this.clickedCardEmitter.emit(this.cards[0].cardName);
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
    this.choice = choice;
    this.cardChoiceEmitter.emit(this.choice);
  }

}
