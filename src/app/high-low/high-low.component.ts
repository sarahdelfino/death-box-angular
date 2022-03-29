import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Inject, OnInit, Input, SimpleChanges, OnDestroy } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Card } from '../card/card';
import { DatabaseService } from '../database.service';
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
      transition("default => flipped", [animate('200ms .2s',)]),
      transition("flipped => default", [animate("400ms")]),
    ]),
    trigger('fadeViewIn', [
      // state("in", style({ opacity: 1 })),
      transition(":enter", [
        style({ opacity: 0 }),
        animate('4s', style({ opacity: 1 }))]),
    ]),
    trigger('fadeViewOut', [
      // state("out", style({ opacity: 0 })),
      transition(":leave", [
        style({ opacity: 1 }),
        animate('2s 3s', style({ opacity: 0 }))]),
    ]),
  ]
})

export class HighLowComponent implements OnInit, OnDestroy {

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
  counter: number;
  wrongGuess: boolean;
  text = '';
  gameId: string;
  subscription: Subscription;

  constructor(
    public dialogRef: MatDialogRef<HighLowComponent>,
    private gameService: GameService,
    private db: DatabaseService,
    @Inject(MAT_DIALOG_DATA) data) {
    // console.log(data.data);
    this.card = data.data.crd[0];
    // console.log(this.card);
    this.newCard = data.data.newCrd;
    this.stackLength = data.data.ln;
    this.counter = this.stackLength;
    console.log(this.stackLength);
    console.log(this.counter);
    this.gameId = data.data.gameId;
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
    this.subscription = this.db.getGame(this.gameId).valueChanges().subscribe(c => {
      console.log(this.counter);
      if (this.counter && this.counter == 0) {
      this.counter = c.seconds;
      console.log(this.counter);
      console.log(c);
      if (this.counter == 1) {
        this.text = "second";
      } else {
        this.text = "seconds";
      }
      } else if (this.counter = 0 && !c.counting) {
        console.log(c);
        let timer = setTimeout(() => {
          this.dialogRef.close();
        }, 800);
      }
    })
  }

  ngOnInit() {
    // this.db.getGame(this.gameId).valueChanges().subscribe(c => {
    //   console.log(this.counter);
    //   this.counter = c.seconds;
    //   console.log(this.counter);
    //   console.log(c);
    //   if (this.counter = 0 && !c.counting) {
    //     console.log(c);
    //     let timer = setTimeout(() => {
    //       this.dialogRef.close();
    //     }, 800);
    //   } else if (this.counter == 1) {
    //     this.text = "second";
    //   } else {
    //     this.text = "seconds";
    //   }
    // })
  }

  ngOnDestroy() {
    this.counter = 0;
    this.subscription.unsubscribe();
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
      if (compare == false) {
        this.wrongGuess = true;
        // console.log(this.stackLength);
        this.counter = this.stackLength;
        this.db.updateGameSeconds(this.gameId, this.counter);
        // console.log(this.counter);
        if (this.counter == 1) {
          this.text = "second";
        } else {
          this.text = "seconds";
        }
        // this.db.getGame(this.gameId).valueChanges().subscribe(c => {
        //   if (this.counter = 0 && !c.counting) {
        //     console.log(c);
        //     let timer = setTimeout(() => {
        //       this.dialogRef.close();
        //     }, 800);
        //   }
        // })
      } else {
        this.title = "Correct!";
        let timer = setTimeout(() => {
          this.dialogRef.close(data);
        }, 1000);
      }
      // let timer = setTimeout(() => {
      //   this.dialogRef.close(data);
      // }, 1000);
    }
  }

  // below is dumb. remove logic pertaining to counter. rely on c.counting && stackLength

  // getGame(id: string) {
  //   this.db.getGame(id).valueChanges().subscribe(c => {
  //     this.counter = c.seconds;
  //     if (this.counter = 0 && !c.counting) {
  //       console.log(c);
  //       let timer = setTimeout(() => {
  //         this.dialogRef.close();
  //       }, 800);
  //     } else if (this.stackLength == 1) {
  //       this.text = "second";
  //     } else {
  //       this.text = "seconds";
  //     }
  //   })
  // }

  finishedAnimations($event) {
    console.log($event);
    // TODO: make call to start counting event
    this.db.updateCounting(this.gameId);
    // console.log(this.counter);
    // this.db.updateGameSeconds(this.gameId, this.counter);
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
