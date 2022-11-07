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
  data = { state: "open" };
  public stacks: any = [];
  public turns = 0;
  public game: Game;
  public cardSelected = false;
  public arrowClicked = false;
  currentTurn: string;
  currentCounter: string;
  filteredPlayers: any = [];
  playerObj = {};
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
  playersView: boolean;
  player: string;
  counting: boolean;

  constructor(private _gameService: GameService,
    private db: DatabaseService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
  ) { }


  ngOnInit() {
    this.id = this._gameService.getId();
    this.player = sessionStorage.getItem('player');
    console.log("player: ", this.player);
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
    this.db.getPlayers(this.id).valueChanges().subscribe(playersData => {
      console.log("players data: ", playersData);
      this.players = playersData;
      console.log(this.currentCounter);
      for (let p in this.players) {
        if (this.players[p].currentPlayer) {
          this.currentTurn = this.players[p].name;
          console.log("current turn: ", this.currentTurn);
        }
        if (this.players[p].name !== this.currentTurn) {
          this.filteredPlayers.push(this.players[p].name);
          console.log("filtered players: ", this.filteredPlayers);
        }
      }
      this.playerObj['filtered'] = this.filteredPlayers;
      this.playerObj['currentTurn'] = this.currentTurn;
      console.log(this.playerObj);
    });
    this.db.getGame(this.id).valueChanges().subscribe(gameData => {
      console.log("game data: ", gameData);
      this.game = gameData;
      if (this.game.counting && this.game.seconds) {
        this.counting = true;
      }
    });
  }

  ngAfterViewInit() {
    // console.log(this.stackChild.addToStack('hi'));
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

  scoresClick() {
    if (this.playersView) {
      this.playersView = false
    } else {
      this.playersView = true;
    }
  }

  getCurPlayer(event: any) {
    this.currentTurn = event;
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

  addToStack(i: number, card: Card) {
    // add card to the top of the stack
    this.stacks[i].unshift(card);
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
      // this.openHighLow(card);
      let clickedCard = card[0];
      let newCard = this.deck.pop();
      let i = this.stacks.indexOf(card);
      let stackLength = this.stacks[i].length;
      let gameId = this.getId();
      this.clickedData = { clickedCard, newCard, stackLength, gameId };
      console.log(this.clickedData);
      this.cardSelected = true;
      // this.clickedData = card;
      // this.openMobile = true;
    } else {
      this.removeStacks();
    }
  }

  goBack() {
    this.cardSelected = false;
  }

  endCounting() {
    this.cardSelected = false;
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

  endHighLow(event: boolean) {
    console.log(event);
    if (event) {
      for (let stack in this.stacks) {
        if (this.stacks[stack][0].cardName === this.clickedData.clickedCard.cardName) {
          this.addToStack(parseInt(stack), this.clickedData.newCard);
          this.turns += 1;
          if (this.turns == 3) {
            this.turns = 0;
          }
          console.log(this.turns);
          this.cardSelected = false;
        }
      }
    } else {
      this.currentCounter = this.filteredPlayers[0];
      console.log(this.currentCounter);
      console.log(this.counting, this.player, this.currentCounter);
    }
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
