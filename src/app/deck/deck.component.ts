import { Component, Input, OnInit } from '@angular/core';
import { DatabaseService } from '../database.service';

export interface CardData {
  imageId: string;
  state: "default" | "flipped" | "moved";
}

@Component({
  selector: 'app-deck',
  templateUrl: './deck.component.html',
  styleUrls: ['./deck.component.css']
})

export class DeckComponent implements OnInit {

  constructor(private db: DatabaseService) {}

  public deckCount: number;
  @Input() id: string;

  ngOnInit() {
    this.db.getDeck(this.id).valueChanges().subscribe(deckData => {
      console.log(deckData);
      this.deckCount = deckData.length;
    })
  }

}
