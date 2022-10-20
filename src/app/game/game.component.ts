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
  data = {state: "open"};
  public stacks: any = [];
  public turns = 0;
  public game: Game;
  public cardSelected = false;
  public arrowClicked = false;
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
  playersView: boolean;

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

  arrowClick(choice: string) {
    this.arrowClicked = true;
    this.cardSelected = false;
    this.clickedData['choice'] = choice;
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

  // openHighLow(card: Card) {
  //   // if (!this.isMobile) {
  //   const dialogConfig = new MatDialogConfig();
  //   let crd = card;
  //   let newCrd = this.deck.pop();
  //   let i = this.stacks.indexOf(card);
  //   let ln = this.stacks[i].length;
  //   let gameId = this.getId();
  //   let curP = this.players;
  //   let c = this.choice;
  //   this.clickedData = { crd, newCrd, ln, gameId, c, curP };
  //   console.log(this.clickedData);

  //   dialogConfig.data = this.clickedData;
  //   dialogConfig.disableClose = true;

  //   const dialogRef = this.dialog.open(HighLowComponent, {
  //     width: '70vw',
  //     height: 'auto',
  //     data: dialogConfig
  //   });

  //   dialogRef.afterClosed().subscribe(
  //     data => {
  //       console.log(data);
  //       var cardIndex = this.stacks.indexOf(card);
  //       // get index of current card and add to stack
  //       if (data.newCrd) {
  //         this.addToStack(cardIndex, data.newCrd);
  //       }
  //       if (data.comp) {
  //         this.turns += 1;
  //         if (this.turns == 3) {
  //           this.turns = 0;
  //         }
  //       }
  //     }
  //   );
  // }

  handleCompareResults(data: any) {
    let modalData = {
      title: '',
      id: this.id,
    }
    console.log(data);
    var cardIndex = this.stacks.indexOf(data.stackCard);
    // console.log(cardIndex);
        // get index of current card and add to stack
        if (data.newCard) {
          this.addToStack(cardIndex, data.newCard);
        }
        console.log(data);
        console.log(this.stacks[cardIndex]);
          this.turns += 1;
          if (this.turns == 3) {
            this.turns = 0;
            modalData.title = 'Next player!';
          }
          if (data.comp == true) {
            modalData.title = 'Correct';
          } else {
            console.log("hello")
          modalData.title = 'Nope!'
          this.db.updateGameSeconds(this.id, this.stacks[cardIndex].length);
        }
        this.openMobile = true;
        console.log(this.clickedData);
        // this.openModal(modalData);
      }

  endHighLow(event) {
    this.openMobile = false;
  }

  openModal(data: any) {
    const dialogConfig = new MatDialogConfig();
    // const timeout = 1000;
    dialogConfig.data = data;
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(HighLowComponent, dialogConfig);

    // dialogRef.afterOpened().subscribe(_ => {
    //   setTimeout(() => {
    //     dialogRef.close();
    //   }, timeout)
    // })
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
