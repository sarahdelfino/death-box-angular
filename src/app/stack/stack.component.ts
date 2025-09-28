import { Component, ElementRef, EventEmitter, inject, Input, Output } from '@angular/core';
import { Card } from '../models/game-state.model';

@Component({
  selector: 'app-stack',
  templateUrl: './stack.component.html',
  styleUrls: ['./stack.component.css'],
  standalone: true,
})
export class StackComponent {
  el = inject(ElementRef);
  sessionPlayer = sessionStorage.getItem('player');

  @Input() cards: Card[] = [];
  @Input() selectedCard: Card | null = null;
  @Input() currentPlayer!: string;
  @Input() id!: string;
  @Input() lastAddedCardId: string | null = null;

  @Output() clickedCardEmitter = new EventEmitter<Card>();

  onCardClick(card: Card) {
    console.log(this.currentPlayer, this.sessionPlayer, card, this.id);
    if (this.currentPlayer === this.sessionPlayer && card) {
      this.clickedCardEmitter.emit(card);
    } else {
      console.log("It's not your turn.");
    }
  }

  altName(card: Card): string {
    let text = `${card.value} of`;
    switch(card.suit) {
      case "S": {
        text = `${card.value} of Spades`
        break;
      }
      case "C": {
        text = `${text} Clubs`
        break;
      }
      case "D": {
        text = `${text} of Diamonds`
        break;
      }
      case "H": {
        text = `${text} of Hearts`
        break;
      }
      default: {
        text = 'Joker'
      }
    }
    return text;
  }

  getTilt(card: Card): string {
    const tilt = card.tilt ?? 0;
    return `rotate(${tilt}deg)`;
  }

  /** limit to last N cards (top of stack) */
  get visibleCards(): Card[] {
    const N = 3;
    return this.cards.slice(0, N);
  }
}
