import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameService } from '../game.service';
import { Card } from '../card/card';
import { HighLowComponent } from '../high-low/high-low.component';
import { ModalComponent } from '../modal/modal.component';
import { RemoveStacksComponent } from '../remove-stacks/remove-stacks.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  providers: [GameService]
})
export class GameComponent implements OnInit {

  public deck: Array<Card>;
  public stacks: any = [];
  public choice = "";
  public turns = 0;

  constructor(private _gameService: GameService,
    private dialog: MatDialog
  ) { }


  ngOnInit() {
    this.deck = this._gameService.createDeck();
    this.createStacks();
  }

  createStacks() {
    for (let i = 0; i < 9; i++) {
      var stack = new Array();
      stack.push(this.deck.pop());
      this.stacks.push(stack);
    }
  }

  addToStack(i, card) {
    // add card to the top of the stack
    this.stacks[i].unshift(card);
    // console.log("Added ", card, "to stack: ", i);
    // console.log(this.stacks);
  }

  clickedCard(card: Card) {
    this._gameService.clickedCard(card);
  }

  chooseCard(card: Card) {
    if (this.deck.length >= 1) {
      this.openHighLow(card);
    } else {
      this.openRemoveStacks();
    }
  }

  openRemoveStacks() {
    const dialogConfig = new MatDialogConfig();
    const timeout = 2000;
    // this.dialog.open(RemoveStacksComponent, dialogConfig);

    const dialogRef = this.dialog.open(RemoveStacksComponent);

    dialogRef.afterOpened().subscribe(_ => {
      setTimeout(() => {
        this.removeStacks();
        dialogRef.close();
      }, timeout)
    })
  }

  openHighLow(card: Card) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.data = card;
    dialogConfig.disableClose = true;
    // this.dialog.open(HighLowComponent, dialogConfig);

    const dialogRef = this.dialog.open(HighLowComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      data => {
        this.choice = data;
        this.compare(this.choice, card);
        if (this.turns == 3) {
          this.openNewPlayer();
          this.turns = 0;
        }
      });
  }

  openNewPlayer() {
    const dialogConfig = new MatDialogConfig();
    const timeout = 1000;

    const dialogRef = this.dialog.open(ModalComponent);

    dialogRef.afterOpened().subscribe(_ => {
      setTimeout(() => {
        dialogRef.close();
      }, timeout)
    })
  }

  compare(choice, card) {
    var newCard = this.deck.pop();
    console.log("newCard: ", newCard.value);
      if (choice == "higher" && (Number(newCard.value) > Number(card[0].value))) {
        console.log("You're right!");
        this.turns = this.turns + 1;
        console.log("You have chosen correctly ", this.turns, " times");
      } else if (choice == "lower" && (Number(newCard.value) < Number(card[0].value))) {
        console.log("You're right!");
        this.turns = this.turns + 1;
        console.log("You have chosen correctly ", this.turns, " times");
      } else {
        console.log("You're wrong!");
      };
    // get index of current card and add to stack
    var cardIndex = this.stacks.indexOf(card);
    this.addToStack(cardIndex, newCard);

  }

  removeStacks() {
    if (this.stacks.length == 9) {
      var removedArray = this.stacks.splice(this.stacks.length - 3, 3);
      console.log("Removing: ", removedArray);
    } else if (this.stacks.length == 6) {
      var removedArray = this.stacks.splice(this.stacks.length - 3, 2);
      console.log("Removing: ", removedArray);
    } else {
      console.log("Removing: ", removedArray);
      var removedArray = this.stacks.splice(this.stacks.length - 3, 1);
    }
    removedArray.forEach(card => {
      for (var c in card) {
        this.deck.push(card[c]);
      }
    });
    this._gameService.shuffle(this.deck)
  }
}

  // private deck: Array<Card>;
  // public table;

  // constructor(private _gameService: GameService,
  //   private dialog: MatDialog) { }

  // ngOnInit() {
  //   this.deck = this._gameService.createDeck();
  //   // this.table = this._gameService.createStacks();
  // }

  // openDialog(card: Card) {
  //   const dialogConfig = new MatDialogConfig();

  //   dialogConfig.data = card;
  //   this.dialog.open(HighLowComponent, dialogConfig);

  //   const dialogRef = this.dialog.open(HighLowComponent, dialogConfig);

  //   dialogRef.afterClosed().subscribe(
  //     data => console.log('You chose: ', data.cardName)
  //   );
  // }

  // clickedCard(card: Card) {
  //   this._gameService.clickedCard(card);
  //   // this.deck.splice(this.deck.indexOf(card), 1)

  // }
