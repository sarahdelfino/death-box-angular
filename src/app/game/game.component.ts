import { Component, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
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
import { InfoComponent } from '../info/info.component';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  providers: [GameService]
})
export class GameComponent implements OnInit, OnDestroy {

  // public deck: Array<Card>;
  public deck: Array<Card>;
  public stacks: any = [];
  public choice = "";
  public turns = 0;
  currentCounter: string;
  id: string;
  newCard: Card;
  pos: Coord;
  isHost: boolean;
  seconds: number;

  constructor(private _gameService: GameService,
    private db: DatabaseService,
    private dialog: MatDialog,
    private route: ActivatedRoute) { }


  ngOnInit() {
    if (localStorage.getItem('host') == 'true') {
      this.isHost = true;
    } else {
      this.isHost = false;
    }
    if (localStorage.getItem('user') == this.currentCounter) {
      console.log("hi");
    }
    // this.getId();
    this.id = this._gameService.getId();
    // this.deck = this._gameService.createDeck();
    // console.log(this.deck);
    // this.stacks = this._gameService.createStacks();
    this.db.getGame(this.id).valueChanges().subscribe(data => {
      // console.log(data);
      this.deck = data.deck;
      // console.log(this.deck);
      this.stacks = data.stacks;
      // console.log(this.stacks);
    });
    // this._gameService.getDeck();
    // this.socketService.getDeck().subscribe(x => {
    //   // console.log(x);
    //   this.deck.push(x);
    //   console.log(this.deck);
    // })
  }

  ngOnDestroy() {
    if (localStorage.getItem('host') == 'true') {
      this.db.deleteGame(this.id);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      const chng = changes[propName];
      const cur = JSON.stringify(chng.currentValue);
      // console.log(chng.currentValue);
    }
  }

  // getId() {
  //   const id = this.route.snapshot.paramMap.get('id');
  //   this.socketService.getGame(id).subscribe(id => this.id = id);
  //   return id;
  // }

  getCurCounter(event: any) {
    this.currentCounter = event;
    console.log("counter: " + this.currentCounter);
  }

  onClick() {
    const dialogConfig = new MatDialogConfig();

    const dialogRef = this.dialog.open(InfoComponent);
  }

  count() {
    console.log("hey");
    // this.db.updateSeconds(this.id, this.currentCounter, this.seconds);
  }

  getLength(i) {
    return this.stacks[i].length;
  }

  addToStack(i, card) {
    // add card to the top of the stack
    this.stacks[i].unshift(card);
    this.db.updateStacks(this._gameService.getId(), this.stacks);
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
    let i = this.stacks.indexOf(card);
    let ln = this.stacks[i].length;

    dialogConfig.data = { crd, newCrd, ln };
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
        } else {
          this.seconds = data[3];
        }
      }
    )
  }

  openModal(data: any) {
    const dialogConfig = new MatDialogConfig();
    const timeout = 1000;
    dialogConfig.data = data;

    const dialogRef = this.dialog.open(ModalComponent, dialogConfig);

    dialogRef.afterOpened().subscribe(_ => {
      setTimeout(() => {
        dialogRef.close();
      }, timeout)
    })
  }

  removeStacks() {
    console.log("BEFORE: " + this.stacks);
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
    this._gameService.shuffle(this.deck);
    console.log(this.stacks);
    this.db.updateStacks(this.id, this.stacks);
    this.db.updateDeck(this.id, this.deck);
  }
}
