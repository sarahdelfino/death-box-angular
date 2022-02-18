import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Inject, OnInit, Input, SimpleChanges } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Card } from '../card/card';
import { GameService } from '../game.service';

export interface CardData {
  imageId: string;
  state: "default" | "flipped";
}

@Component({
  selector: 'app-high-low',
  templateUrl: './high-low.component.html',
  styleUrls: ['./high-low.component.css'],
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
      transition("default => flipped", [animate("200ms")]),
      transition("flipped => default", [animate("400ms")])
    ])
  ]
})
export class HighLowComponent implements OnInit {

  // @Input()
  // public card: Card;

  public card: Card;
  public choice: string;
  newCard: Card;
  data: CardData = {
    imageId: "",
    state: "default"
  };
  title: string;
  stackLength: number;

  constructor(
    public dialogRef: MatDialogRef<HighLowComponent>,
    private gameService: GameService,
    @Inject(MAT_DIALOG_DATA) data) {
    // console.log(data.data);
    this.card = data.data.crd[0];
    // console.log(this.card);
    this.newCard = data.data.newCrd;
    this.stackLength = data.data.ln;
    if (parseInt(this.card.value) <= 10 && parseInt(this.card.value) >= 2) {
      this.title = `Higher or lower than ${this.card.value}?`;
    } else if (parseInt(this.card.value) == 11) {
      this.title = "Higher or lower than a jack?"
    } else if (parseInt(this.card.value) == 12) {
      this.title = "Higher or lower than a queen?"
    } else if (parseInt(this.card.value) == 13) {
      this.title = "Higher or lower than a king?"
    } else {
      this.title = "Higher or lower than an ace?"
    }
  }

  ngOnInit() {

  }

  cardFlip() {
    if (this.data.state === "default") {
      this.data.state = "flipped";
    } else {
      this.data.state = "default";
    }
  }

  flipEnd($event) {
    if ($event.fromState != 'void') {
      let compare = this.gameService.compare(this.choice, this.card.value, this.newCard.value);
      let data = [this.card, this.newCard, compare, this.stackLength];
      if (compare == true) {
        this.title = "Correct!";
      } else if (compare == false && this.stackLength > 1) {
        this.title = `Wrong! Drink for ${this.stackLength} seconds`;
      } else {
        this.title = `Wrong! Drink for ${this.stackLength} second`;
      }
      let timer = setTimeout(() => {
        this.dialogRef.close(data);
      }, 1000);
    }
  }

  higher() {
    this.choice = "higher";
    this.cardFlip();
  }

  lower() {
    this.choice = "lower";
    this.cardFlip();
  }



}
