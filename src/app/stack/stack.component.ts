import { Component, EventEmitter, OnInit, Input, Output, SimpleChanges } from '@angular/core';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { Card } from '../card/card';
import { GameService } from '../game.service';
import { DatabaseService } from '../database.service';

@Component({
  selector: 'app-stack',
  templateUrl: './stack.component.html',
  styleUrls: ['./stack.component.css'],
  animations: [
    trigger('stackAdd', [
      transition(':enter',
      animate('800ms', keyframes([
        style({'box-shadow': 'none', offset: 0}),
        style({'box-shadow': 'rgba(106, 152, 92, 0.4) 5px 5px, rgba(106, 152, 92, 0.3) 10px 10px, rgba(106, 152, 92, 0.2) 15px 15px, rgba(106, 152, 92, 0.1) 20px 20px, rgba(106, 152, 92, 0.05) 25px 25px', offset: 0.4}),
        style({'box-shadow': 'rgba(106, 152, 92, 0.4) 5px 5px, rgba(106, 152, 92, 0.3) 10px 10px, rgba(106, 152, 92, 0.2) 15px 15px, rgba(106, 152, 92, 0.1) 20px 20px, rgba(106, 152, 92, 0.05) 25px 25px', offset: 0.8}),
        style({'box-shadow': 'none', offset: 1.0}),
      ]))),
    ]),
  ]
})
export class StackComponent implements OnInit {
  selectedStack: Card;
  wasClicked = false;
  stackVisibility = false;
  choice: string;
  added: boolean = false;
  sessionPlayer = sessionStorage.getItem('player');

  @Input()
  public cards: any = [];

  @Input() public id: any;

  @Input() currentPlayer: string;

  @Output()
  private clickedCardEmitter: EventEmitter<Card> = new EventEmitter();
  
  @Output() public cardChoiceEmitter: EventEmitter<string> = new EventEmitter();

  constructor(private _gameService: GameService, private db: DatabaseService) { }

  ngOnInit(): void {
    // console.log(this.id);

    // if (sessionStorage.getItem('player') !== this.currentPlayer) {
      
    // }
  }


  public add(card: Card) {
    this.cards.splice(0, 0, card);
  }

  onCardClick(stack: Card) {
      this.selectedStack = stack;
    // console.log("HMMM: ", this.selectedStack[0]);
    // console.log("HMMM: ", this.cards[0]);
    // this.clickedCardEmitter.emit(this.cards[0].cardName);
  }

  addedToggle() {
    this.added = !this.added;
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
