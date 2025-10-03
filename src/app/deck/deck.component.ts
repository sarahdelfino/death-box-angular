import { Component, EventEmitter, inject, input, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Card } from '../models/game-state.model';
import { GameStore } from '../game.store';

export interface CardData {
  imageId: string;
  state: "default" | "flipped" | "moved";
}

@Component({
  selector: 'app-deck',
  templateUrl: './deck.component.html',
  styleUrls: ['./deck.component.css'],
})

export class DeckComponent {

  @Input() card: Card | null = null;
  @Input() isFlipped: boolean = false;

  drawCard() {
    if (!this.card) return;

    this.isFlipped = true;

    setTimeout(() => {
      this.isFlipped = false;
      this.card = null;
    }, 800);
  }

}
