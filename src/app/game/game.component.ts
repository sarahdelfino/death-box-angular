import { Component, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { GameService } from '../game.service';
import { Card } from '../card/card';
import { HighLowComponent } from '../high-low/high-low.component';
import { ModalComponent } from '../modal/modal.component';
import { RemoveStacksComponent } from '../remove-stacks/remove-stacks.component';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../database.service';
import { InfoComponent } from '../info/info.component';
import { Game } from '../game';
import { NONE_TYPE } from '@angular/compiler';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  providers: [GameService],
  animations: [
    trigger('openClose', [
      state('open', style({
        transform: 'translateY(0px)'
      })),
      state('closed', style({
        transform: 'translateY(400px)'
      })),
      state('void', style({
        transform: 'translateY(400px)'
      })),
      transition('open <=> closed', [
        animate('.5s')
      ]),
      transition(':enter', [
        animate('.5s ease-in')
      ]),
      transition(':leave', [
        animate('1s .5s ease-out')
      ]),
    ]),
  ],
})
export class GameComponent implements OnInit, OnDestroy {

  public deck: Array<Card>;
  data = {state: "open"};
  public stacks: any = [];
  public choice = "";
  public turns = 0;
  public game: Game;
  currentPlayer: string;
  currentCounter;
  id: string;
  newCard: Card;
  isMobile: boolean;
  isHost: boolean;
  seconds: number;
  players: any = [];
  openMobile: boolean;
  clickedData;

  constructor(private _gameService: GameService,
    private db: DatabaseService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
  ) { }


  ngOnInit() {
    if (window.innerWidth < 500) {
      this.isMobile = true;
      console.log(this.isMobile);
    }
    if (sessionStorage.getItem('host') == 'true') {
      this.isHost = true;
      this.id = this._gameService.getId();
      this.deck = this._gameService.createDeck();
      this.stacks = this._gameService.createStacks(this.deck);
    } else {
      this.isHost = false;
    }
  }

  ngOnDestroy() {
    sessionStorage.clear();
    if (sessionStorage.getItem('host') == 'true') {
      this.db.deleteGame(this.id);
      //  TODO: delete player from game
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      const chng = changes[propName];
      const cur = JSON.stringify(chng.currentValue);
    }
  }

  getId(): string {
    const id = this.route.snapshot.paramMap.get('id');
    return id;
  }

  getCurPlayer(event: any) {
    this.currentPlayer = event;
  }

  getPlayerList(event: any) {
    this.players = event;
  }

  onClick() {
    const dialogConfig = new MatDialogConfig();
    const dialogRef = this.dialog.open(InfoComponent);
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
    if (this.deck.length > 1) {
      this.openHighLow(card);
      // this.clickedData = card;
      // this.openMobile = true;
    } else {
      this.removeStacks();
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
    // if (!this.isMobile) {
    // const dialogConfig = new MatDialogConfig();
    let crd = card;
    let newCrd = this.deck.pop();
    let i = this.stacks.indexOf(card);
    let ln = this.stacks[i].length;
    let gameId = this.getId();
    let curP = this.players;
    this.clickedData = { crd, newCrd, ln, gameId, curP };
    console.log(this.clickedData);
    if (this.clickedData) {
      this.openMobile = true;
    }

    // dialogConfig.data = { crd, newCrd, ln, gameId, curP };
    // dialogConfig.disableClose = true;

    // const dialogRef = this.dialog.open(HighLowComponent, {
    //   width: 'auto',
    //   height: 'auto',
    //   data: dialogConfig
    // });

    // dialogRef.afterClosed().subscribe(
    //   data => {
    //     var cardIndex = this.stacks.indexOf(card);
    //     // get index of current card and add to stack
    //     if (data.newCrd) {
    //       this.addToStack(cardIndex, data.newCrd);
    //     }
    //     if (data.comp) {
    //       this.turns += 1;
    //       if (this.turns == 3) {
    //         this.turns = 0;
    //       }
    //     }
    //   }
    // )
    // } else {
    //   console.log("hello");
    // }
  }

  endHighLow(event) {
    this.openMobile = false;
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
  }
}
