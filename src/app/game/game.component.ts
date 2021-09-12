import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameService } from '../game.service';
import { Card } from '../card/card';
import { HighLowComponent } from '../high-low/high-low.component';
import { ModalComponent } from '../modal/modal.component';
import { RemoveStacksComponent } from '../remove-stacks/remove-stacks.component';
import { PlayersFormComponent } from '../players-form/players-form.component';

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
  // public data: any = [];

  constructor(private _gameService: GameService,
    private dialog: MatDialog) { }


  ngOnInit() {
    this.deck = this._gameService.createDeck();
    this.createStacks();
    // this.openPlayerModal();
  }

  createStacks() {
    for (let i = 0; i < 9; i++) {
      var stack = new Array();
      stack.push(this.deck.pop());
      this.stacks.push(stack);
    }
  }

  getLength(i) {
    return this.stacks[i].length;
  }

  addToStack(i, card) {
    // add card to the top of the stack
    this.stacks[i].unshift(card);
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
        // this._gameService.turn();
        // this.openModal(modalData);
        // this.turns = 0;
        // if (this.turns == 3) {
        //   var tmp = this._gameService.getCurrentPlayer();
        //   console.log("TMP: ", tmp);
        //   console.log("LEN: ", this._gameService.players.length);
        //   if (tmp == this._gameService.players.length - 1) {
        //     console.log("End of player list..");
        //     this._gameService.setNextPlayer(0);
        //   } else {
        //     console.log("NEW TMP: ", tmp + 1);
        //     this._gameService.setNextPlayer(tmp + 1);
        //   }
        if (this.turns == 3) {
          var tmp = this._gameService.getCurrentPlayer();
          console.log("TMP: ", tmp);
          console.log("LEN: ", this._gameService.players.length);
          if (tmp == this._gameService.players.length - 1) {
            console.log("End of player list..");
            this._gameService.setNextPlayer(0);
          } else {
            console.log("NEW TMP: ", tmp + 1);
            this._gameService.setNextPlayer(tmp + 1);
          }
          console.log(this._gameService.players);
          var currentPlayer = this._gameService.players[tmp].name;
          var title = `${currentPlayer}, you're next!`;
          var modalData = {
            "title": title,
            "currentPlayer": currentPlayer
          };
          this.openModal(modalData);
          this.turns = 0;
        }
      });
  }

  openModal(data: any) {
    const dialogConfig = new MatDialogConfig();
    const timeout = 1000;
    dialogConfig.data = data;
    console.log("DIALOGCONFIG: ", dialogConfig.data);

    const dialogRef = this.dialog.open(ModalComponent, dialogConfig);

    dialogRef.afterOpened().subscribe(_ => {
      setTimeout(() => {
        dialogRef.close();
      }, timeout)
    })
  }

  compare(choice, card) {
    var newCard = this.deck.pop();
    console.log("newCard: ", newCard.value);
    var cardIndex = this.stacks.indexOf(card);
        // get index of current card and add to stack
        this.addToStack(cardIndex, newCard);
    if (choice == "higher" && (Number(newCard.value) > Number(card[1].value))) {
      console.log("You're right!");
      this.turns = this.turns + 1;
      console.log("You have chosen correctly ", this.turns, " times");
    } else if (choice == "lower" && (Number(newCard.value) < Number(card[1].value))) {
      console.log("You're right!");
      this.turns = this.turns + 1;
      console.log("You have chosen correctly ", this.turns, " times");
    } else {
      var body = "You're wrong! You must drink for ";
      var drinkFor = this.getLength(cardIndex);
      var body = body + drinkFor + " seconds!";
      var modalData = {"body": body};
      this.openModal(modalData);
      console.log(body);
      console.log(this.stacks);
    };
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
