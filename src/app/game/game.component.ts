import { Component, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameService } from '../game.service';
import { Card } from '../card/card';
import { HighLowComponent } from '../high-low/high-low.component';
import { ModalComponent } from '../modal/modal.component';
import { RemoveStacksComponent } from '../remove-stacks/remove-stacks.component';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Coord } from 'src/coord';
import { DatabaseService } from '../database.service';
import { Player } from '../player';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  providers: [GameService]
})
export class GameComponent implements OnInit {

  // public deck: Array<Card>;
  public deck: Array<Card>;
  public stacks: any = [];
  public choice = "";
  public turns = 0;
  currentPlayer: string;
  id: string;
  newCard: Card;
  pos: Coord;

  constructor(private _gameService: GameService,
    private db: DatabaseService,
    private dialog: MatDialog,
    private route: ActivatedRoute) { }


  ngOnInit() {
    // this.getId();
    this.id = this._gameService.getId();
    // this.deck = this._gameService.createDeck();
    // console.log(this.deck);
    // this.stacks = this._gameService.createStacks();
    this.db.getGame(this.id).valueChanges().subscribe(data => {
      console.log(data);
      this.deck = data.deck;
      console.log(this.deck);
      this.stacks = data.stacks;
      console.log(this.stacks);
    });
    // this._gameService.getDeck();
    // this.socketService.getDeck().subscribe(x => {
    //   // console.log(x);
    //   this.deck.push(x);
    //   console.log(this.deck);
    // })
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      const chng = changes[propName];
      const cur = JSON.stringify(chng.currentValue);
      console.log(chng.currentValue);
    }
  }

  // getId() {
  //   const id = this.route.snapshot.paramMap.get('id');
  //   this.socketService.getGame(id).subscribe(id => this.id = id);
  //   return id;
  // }

  getLength(i) {
    return this.stacks[i].length;
  }

  addToStack(i, card) {
    // add card to the top of the stack
    this.stacks[i].unshift(card);
    console.log(this.stacks);
    this.db.updateStacks(this._gameService.getId(), this.stacks, i);
    this.db.updateDeck(this._gameService.getId(), this.deck);
  }

  clickedCard(card: Card) {
    this._gameService.clickedCard(card);
  }

  chooseCard(card: Card) {
    if (this.deck.length > 1) {
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

    dialogConfig.data = { crd, newCrd };
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(HighLowComponent, {
      width: 'auto',
      height: 'auto',
      data: dialogConfig
    });

    dialogRef.afterClosed().subscribe(
      data => {
        var cardIndex = this.stacks.indexOf(card);
        // get index of current card and add to stack
        this.addToStack(cardIndex, data[1]);
        if (data[2] == true) {
          this.turns += 1;
          if (this.turns == 3) {
            this.turns = 0;
          }
        }
      }
    )
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
