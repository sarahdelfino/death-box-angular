import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Card } from '../card/card';
import { GameService } from '../game.service';

export interface CardData {
  imageId: string;
  state: "default" | "flipped" | "moved";
}

@Component({
  selector: 'app-deck',
  templateUrl: './deck.component.html',
  styleUrls: ['./deck.component.css'],
  animations: [
    trigger("cardFlip", [
      state(
        "default",
        style({
          transform: "none"
        })
      ),
      state(
        "flipped",
        style({
          transform: "rotateY(180deg)",
        })
      ),
      state(
        "moved",
        style({
          transform: "translateY(0)"
        })
      ),
      transition("default => flipped", [animate("400ms")]),
      transition("flipped => moved", [animate("400ms")])
    ])
  ]
})
export class DeckComponent implements OnInit {
  @Input()
  public card: Card;

  data: CardData = {
    imageId: "",
    state: "default"
  };

  deckCount: number;
  changeLog = [];

  constructor(private game: GameService) { }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      const chng = changes[propName];
      const cur  = JSON.stringify(chng.currentValue);
      // console.log(chng.currentValue);
      const prev = JSON.stringify(chng.previousValue);
      this.changeLog.push(`${propName}: currentValue = ${cur}, previousValue = ${prev}`);
      // console.log(this.changeLog);
      if (cur != "undefined") {
        this.card.cardPath = chng.currentValue.cardPath;
        this.data.imageId = this.card.cardName;
        // console.log(this.card);
        this.cardFlip();
        
      }
    }
  }

  ngOnInit(): void {
      this.deckCount = this.game.getDeckLength();
      if(this.card == null) {
        this.card = new Card("undefined", "undefined");
      }
  }

  cardFlip() {
    if (this.data.state === "default") {
      this.data.state = "flipped";
    } else {
      this.data.state = "moved";
    }
  }

}
