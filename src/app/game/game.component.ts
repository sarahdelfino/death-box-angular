import { Component, OnDestroy, OnInit, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
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
import { StackComponent } from '../stack/stack.component';
import { NONE_TYPE } from '@angular/compiler';
import { stringify } from 'querystring';
import { Subscription } from 'rxjs';
import { Player } from '../player';

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
        transform: 'translateY(200px)'
      })),
      state('void', style({
        transform: 'translateY(200px)'
      })),
      transition('open <=> closed', [
        animate('.25s')
      ]),
      transition(':enter', [
        animate('.25s ease-in')
      ]),
      transition(':leave', [
        animate('.25s .25s ease-out')
      ]),
    ]),
  ],
})
export class GameComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(StackComponent) stackChild: StackComponent;
  
  public deck: Array<Card>;
  data = {state: "open"};
  public stacks: any = [];
  public turns = [];
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
  choice: string;
  added: boolean;
  counter: number;
  compareText: string;
  playersList;
  cardData;

  constructor(private _gameService: GameService,
    private db: DatabaseService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
  ) { }


  ngOnInit() {
    this.id = this._gameService.getId();
    if (window.innerWidth < 500) {
      this.isMobile = true;
    }
    if (sessionStorage.getItem('host') == 'true') {
      this.isHost = true;
      this.deck = this._gameService.createDeck();
      this.stacks = this._gameService.createStacks(this.deck);
    } else {
      this.isHost = false;
    }

  }

  ngAfterViewInit() {
    this.db.getPlayers(this.id).valueChanges().subscribe(playersData => {
      console.log(playersData);
      this.playersList = playersData;
      for (let p in this.playersList) {
        if (this.playersList[p]['currentPlayer']) {
          console.log(this.playersList[p].name);
          this.currentPlayer = this.playersList[p].name;
        }
      }
    });
    this.db.getGame(this.id).valueChanges().subscribe(gameData => {
      if (gameData.seconds) {
        console.log(gameData.seconds);
        let test = [];
        test.push(gameData.seconds);
        this.seconds = test[0];
      }
    })
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
    // this.stacks[i].unshift(card);
    console.log(this.stacks);
    this.stacks[i] = [card, ...this.stacks[i]];
    console.log(this.stacks);
  }

  clickedCard(card: Card) {
    // this._gameService.clickedCard(card);
    this.chooseCard(card);
  }

  cardChoice(ch: string) {
    console.log(ch);
    this.choice = ch;
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
    const dialogConfig = new MatDialogConfig();
    let crd = card;
    let newCrd = this.deck.pop();
    let i = this.stacks.indexOf(card);
    let ln = this.stacks[i].length;
    let gameId = this.getId();
    let curP = this.players;
    let c = this.choice;
    this.cardData = { crd, newCrd, ln, gameId, c };
    console.log(this.cardData);
    // console.log(this.clickedData);
    if (this.clickedData) {
      // this.openMobile = true;
      // console.log(this.openMobile);
    }

    // const dialogRef = this.dialog.open(HighLowComponent, {
    //   width: '90vw',
    //   height: 'auto',
    //   data: dialogConfig
    // });

    // dialogRef.afterClosed().subscribe(
    //   data => {
    //     console.log(data);
    //     var cardIndex = this.stacks.indexOf(card);
    //     // get index of current card and add to stack
    //     if (data.newCrd) {
    //       this.addToStack(cardIndex, data.newCrd);
    //     }
    //     if (data.comp) {
    //       this.turns.push('x');
    //       if (this.turns.length == 3) {
    //         this.turns = [];
    //         this.getNextPlayer();
    //       }
    //     }
    //   }
    // );
  }

  getNextPlayer() {
    let playerIndex = 0;
    for (let i in this.playersList) {
      if (this.playersList[i]['currentPlayer']) {
        playerIndex = parseInt(i);
      }
    }
    this._gameService.getNextPlayer(playerIndex, this.playersList);
    // let temp = this.playersList;
    // console.log(temp.length);
    // for (let i in temp) {
    //   console.log(temp[i]);
    //   if (temp[i]['currentPlayer']) {
    //     delete temp[i]['currentPlayer'];
    //     console.log(temp[i]);
        
    //     let newIndex = parseInt(i) + 1;
    //     temp[newIndex].currentPlayer = true;
    //     console.log(temp[newIndex]);
    //   }
    // }
    // console.log(temp);
    // this.db.updatePlayers(this.id, temp);
  }

  handleCompareResults(data: any) {
    var cardIndex = this.stacks.indexOf(data.stackCard);
        // get index of current card and add to stack
        if (data.newCard) {
          this.addToStack(cardIndex, data.newCard);
        }
        if (data.comp) {
          this.turns.push('x');
          if (this.turns.length == 3) {
            this.turns = null;
            this.cardData = null;
            this.getNextPlayer();
          }
        }
      }

      countClicked() {
        console.log("SEC: " + this.seconds);
        // if (this.seconds && this.seconds > 0) {
        let newSeconds = this.seconds - 1;
        console.log("NEW SEC: " + newSeconds);
        this.seconds = newSeconds;
        console.log("GAME SECONDS: " + this.seconds);
        this.db.updateGameSeconds(this.id, newSeconds);
        // console.log(this.seconds);
        if (newSeconds == 0) {
          console.log("HEREEEEE");
          // let timer = setTimeout(() => {
          //   this.seconds = null;
          //   this.cardData = null;
          //   this.db.deleteSeconds(this.id);
          // }, 6000);
        // }
      }
      }

  endHighLow(event) {
    this.openMobile = false;
  }

  openModal(data: any) {
    const dialogConfig = new MatDialogConfig();
    // const timeout = 1000;
    dialogConfig.data = data;
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(ModalComponent, dialogConfig);

    // dialogRef.afterOpened().subscribe(_ => {
    //   setTimeout(() => {
    //     dialogRef.close();
    //   }, timeout)
    // })
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
    this._gameService.shuffle(this.deck);
    console.log(this.stacks);
  }
}
