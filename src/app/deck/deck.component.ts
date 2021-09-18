import { Component, Input, OnInit } from '@angular/core';
import { GameService } from '../game.service';

@Component({
  selector: 'app-deck',
  templateUrl: './deck.component.html',
  styleUrls: ['./deck.component.css']
})
export class DeckComponent implements OnInit {

  deckCount: number;

  constructor(private game: GameService) { }

  ngOnInit(): void {
      this.deckCount = this.game.getDeckLength();
  }

}
