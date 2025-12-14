import { Component, ElementRef, EventEmitter, inject, Input, Output } from '@angular/core';
import { Card } from '../models/game-state.model';

@Component({
  selector: 'app-stack',
  templateUrl: './stack.component.html',
  styleUrls: ['./stack.component.scss'],
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
  @Input() wrongCardId: string | null = null;

  @Output() clickedCardEmitter = new EventEmitter<Card>();

  onCardClick(card: Card) {
    if (this.currentPlayer === this.sessionPlayer && card) {
      this.clickedCardEmitter.emit(card);
    } else {
      console.log("It's not your turn.");
    }
  }

  isWrong(card: Card): boolean {
    return !!this.wrongCardId && this.wrongCardId === card.cardName;
  }

  altName(card: Card): string {
    let text = `${card.value} of`;
    switch (card.suit) {
      case 'S': return `${card.value} of Spades`;
      case 'C': return `${card.value} of Clubs`;
      case 'D': return `${card.value} of Diamonds`;
      case 'H': return `${card.value} of Hearts`;
      default:  return 'Joker';
    }
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