import { Component, Input } from '@angular/core';

export interface CardData {
  imageId: string;
  state: "default" | "flipped" | "moved";
}

@Component({
  selector: 'app-deck',
  templateUrl: './deck.component.html',
  styleUrls: ['./deck.component.css']
})

export class DeckComponent {

  @Input() deckCount: number;

}
