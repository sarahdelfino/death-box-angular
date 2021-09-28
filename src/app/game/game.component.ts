import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameService } from '../game.service';
import { Card } from '../card/card';
import { HighLowComponent } from '../high-low/high-low.component';
import { ModalComponent } from '../modal/modal.component';
import { RemoveStacksComponent } from '../remove-stacks/remove-stacks.component';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { SocketioService } from '../socketio.service';
import { Coord } from 'src/coord';
import { DatabaseService } from '../database.service';


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
  id: string;
  newCard: Card;
  pos: Coord;
  // public data: any = [];

  constructor(private _gameService: GameService,
    private db: DatabaseService,
    private dialog: MatDialog,
    private socketService: SocketioService,
    private route: ActivatedRoute) { }


  ngOnInit() {
    this.getId();
    this.deck = this._gameService.createDeck();
    // this.createStacks();
    this.stacks = this._gameService.createStacks();
    // this.openPlayerModal();
  }

  getId() {
    const id = this.route.snapshot.paramMap.get('id');
    this.socketService.getGame(id).subscribe(id => this.id = id);
    return id;
  }

  createStacks() {
    // for (let i = 0; i < 9; i++) {
    //   var stack = new Array();
    //   stack.push(this.deck.pop());
    //   this.stacks.push(stack);
    // }
    // this._gameService.createStacks();
    // this.stacks = this._gameService.createStacks();
  }

  getLength(i) {
    return this.stacks[i].length;
  }

  addToStack(i, card) {
    // add card to the top of the stack
    // this.stacks[i].unshift(card);
    // this.stacks = this._gameService.addToStack(i, card);
    console.log(this.stacks);
    console.log(this.stacks[i]);
    this.stacks[i].unshift(card);
  }

  clickedCard(card: Card) {
    this._gameService.clickedCard(card);
  }

  chooseCard(card: Card) {
    // console.log(card);
    // this.pos = this.xy(this.stacks.indexOf(card));
    // console.log(this.pos);
    
    if (this.deck.length >= 1) {
      this.openHighLow(card);
    } else {
      this.openRemoveStacks();
    }
  }

  xy(i): Coord {
    return {
      x: i % 3,
      y: Math.floor(i / 3)
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
    let crd = card;
    let newCrd = this.deck.pop();

    dialogConfig.data = {crd, newCrd};
    dialogConfig.disableClose = true;
    // this.dialog.open(HighLowComponent, dialogConfig);

    // const dialogRef = this.dialog.open(HighLowComponent, dialogConfig);

    const dialogRef = this.dialog.open(HighLowComponent, {
      width: 'auto',
      height: 'auto',
      data: dialogConfig
    });

    dialogRef.afterClosed().subscribe(
      data => {
        console.log(data);
        var cardIndex = this.stacks.indexOf(card);
        console.log(cardIndex);
        // get index of current card and add to stack
        this.addToStack(cardIndex, data[1]);
        // this.choice = data;
        // this.compare(this.choice, card);
        // if (this.turns == 3) {
        //   var currentPlayer = 'next player';
        //   var title = `${currentPlayer}, you're up!`;
        //   var modalData = {
        //     "title": title,
        //     "currentPlayer": currentPlayer
        //   };
        //   this.openModal(modalData);
        //   this.turns = 0;
        // }
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
    // this.newCard = this.deck.pop();
    // this.pos = this.xy(this.stacks.indexOf(card));
    // this.newCard.position = this.pos;
    // console.log(this.pos);
    // console.log("newCard: ", this.newCard.value);
    // var cardIndex = this.stacks.indexOf(card);
    //     // get index of current card and add to stack
    //     this.addToStack(cardIndex, this.newCard);
    // if (choice == "higher" && (Number(this.newCard.value) > Number(card[1].value))) {
    //   console.log("You're right!");
    //   this.turns = this.turns + 1;
    //   console.log("You have chosen correctly ", this.turns, " times");
    // } else if (choice == "lower" && (Number(this.newCard.value) < Number(card[1].value))) {
    //   console.log("You're right!");
    //   this.turns = this.turns + 1;
    //   console.log("You have chosen correctly ", this.turns, " times");
    // } else {
    //   var body = "You're wrong! Drink for ";
    //   var drinkFor = this.getLength(cardIndex);
    //   var body = body + drinkFor + " seconds!";
    //   var modalData = {"body": body};
    //   this.openModal(modalData);
    //   console.log(body);
    //   console.log(this.stacks);
    // };
    // this._gameService.compare(choice, card);
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
