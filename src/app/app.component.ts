import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Card } from './card/card';
import { GameService } from './game.service';
import { HighLowComponent } from './high-low/high-low.component';
import { Stack } from './stack';
import { StackComponent } from './stack/stack.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [GameService]
})
export class AppComponent {

  public deck: Array<Card>;
  public stacks: any = [];
  public choice = "";

  constructor(private _gameService: GameService,
    private dialog: MatDialog
  ) { }


  ngOnInit() {
    this.deck = this._gameService.createDeck();
    this.createStacks();
  }

  createStacks() {
    var tmp = new Array;
    for (let i = 0; i < 9; i++) {
      var stack = new Array();
      // var tmpArry = Array();
      stack.push(this.deck.pop());
      // stack.cards = tmpArry;
      // tmp.push(stack);
      this.stacks.push(stack);
    }
    // this.stacks.push(tmp);
    console.log(this.stacks);
  }

  addToStack() {
    this.stacks[0].push(this.deck.pop());
    console.log("addToStack(): ", this.stacks);
  }

  clickedCard(card: Card) {
    this._gameService.clickedCard(card);
  }

  openDialog(card: Card) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.data = card;
    this.dialog.open(HighLowComponent, dialogConfig);

    const dialogRef = this.dialog.open(HighLowComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      data => {
        this.choice = data;
        this.compare(this.choice, card);
      });
  }

  compare(choice, card) {
    console.log("card: ", card[0].value);
    var newCard = this.deck.pop();
    console.log("newCard: ", newCard.value);
    if (choice == "higher" && (Number(newCard.value) > Number(card[0].value))) {
      console.log("You're right!");
    } else if (choice == "lower" && (Number(newCard.value) < Number(card[0].value))) {
      console.log("You're right!");
    } else {
      console.log("You're wrong!");
    };
    for (let s in this.stacks) {
      console.log(s);
    }

  }
}
