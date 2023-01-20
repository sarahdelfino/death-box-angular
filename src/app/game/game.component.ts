import { Component, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { GameService } from '../game.service';
import { Card } from '../card/card';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../database.service';
import { Game } from '../game';
import { StackComponent } from '../stack/stack.component';

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
export class GameComponent implements OnInit {

  @ViewChild(StackComponent) stackChild: StackComponent;

  public deck: Array<Card>;
  data = { state: "open" };
  public stacks = [];
  public turns = 0;
  public game = new Game();
  public cardSelected = false;
  public arrowClicked = false;
  public sessionPlayer = sessionStorage.getItem('player');
  public currentCounter;
  currentTurn: string;
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
    private route: ActivatedRoute,
  ) { }


  ngOnInit() {
    this.id = this._gameService.getId();
    this.player = sessionStorage.getItem('player');
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
    this.db.getGame(this.id).valueChanges().subscribe(gameData => {
      this.game = gameData;
      this.game.id = this.id;
      this.game.counting = gameData.counting;
      this.game.counter = gameData.counter;
      this.game.players = gameData.players;
      this.game.seconds = gameData.seconds;
      this.game.started = gameData.started;
      console.log("game data: ", this.game);
      const tmpPlayers = [];
      console.log("player data from fb", this.game.players);
      for (const p in gameData.players) {
        if (gameData.players[p].currentPlayer) {
          this.currentTurn = p;
          console.log("current turn: ", this.currentTurn);
        } else {
          tmpPlayers.push(p);
        }
      }
      this.players = gameData.players;
      this.filteredPlayers = tmpPlayers;
      // const playersSubject = new BehaviorSubject(this.filteredPlayers[0]);
      this.playerObj['filtered'] = this.filteredPlayers;
      this.playerObj['currentTurn'] = this.currentTurn;
      if (!gameData.counter) {
        this.db.setCounter(this.id, this.filteredPlayers[0]).then(() => {
          console.log("successfully updated counter to: ", this.filteredPlayers[0]);
          this.currentCounter = this.filteredPlayers[0];
        });
      }
    });
    console.log(this.game);
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

  getLength(i) {
    return this.stacks[i].length;
  }

  addToStack(i: number, card: Card) {
    // add card to the top of the stack
    this.stacks[i].unshift(card);
  }

  cardChoice(ch: string) {
    this.choice = ch;
  }

  chooseCard(card: Card) {
    if (this.deck.length > 1) {
      const clickedCard = card[0];
      console.log("BEFORE CARD PULLED: ", this.deck);
      const newCard = this.deck.pop();
      console.log("AFTER CARD PULLED: ", this.deck);
      const i = this.stacks.indexOf(card);
      const stackLength = this.stacks[i].length;
      const gameId = this.getId();
      this.clickedData = { clickedCard, newCard, stackLength, gameId };
      console.log(this.clickedData);
      this.cardSelected = true;
    } else {
      this.removeStacks();
    }
  }

  goBack() {
    this.cardSelected = false;
  }

  count() {
    console.log("current counter: ", this.currentCounter);
    console.log("filtered: ", this.filteredPlayers);
    this.db.decrementSeconds(this.game.id);
    if (this.game.seconds > 0) {
      this.getNextCounter(this.currentCounter);
    } else {
      const timer = setTimeout(() => {
        this.db.endCounting(this.game.id).then(() => {
          console.log("ended counting successfully!");
          this.counting = false;
        });
      }, 1000);
    }
  }

  getNextCounter(currentCounter: string) {
    console.log(this.filteredPlayers);
    const curCountIndex = this.filteredPlayers.indexOf(currentCounter);
    console.log(curCountIndex);
    let newIndex = curCountIndex + 1;
    console.log("bef: ", newIndex);
    console.log(this.filteredPlayers.length);
    if (newIndex == this.filteredPlayers.length) {
      newIndex = 0;
    }
    console.log(newIndex);
    this.currentCounter = this.filteredPlayers[newIndex];
    console.log("next counter: ", this.currentCounter);
    this.db.setCounter(this.game.id, this.currentCounter).then(() => {
      console.log("set counter successfully: ", this.currentCounter);
    });
  }

  endCounting(card: any) {
    console.log("BEFORE PUTTING BACK: ", this.deck);
    this.deck.push(card);
    console.log("AFTER PUTTING BACK: ", this.deck);
    this._gameService.shuffle(this.deck);
    console.log("AFTER SHUFFLE: ", this.deck);
    this.cardSelected = false;
  }

  endHighLow(wrongGuess: boolean) {
    for (const stack in this.stacks) {
      if (this.stacks[stack][0].cardName === this.clickedData.clickedCard.cardName) {
        this.addToStack(parseInt(stack), this.clickedData.newCard);
        if (!wrongGuess) {
          this.turns += 1;
          if (this.turns == 3) {
            this.turns = 0;
            this.getNextPlayer();
          }
        }
        console.log(this.turns);
        this.cardSelected = false;
      }
    }
  }

  getNextPlayer() {
    console.log("in get next player");
    const list = Object.keys(this.players);
    const nextIndex = list.indexOf(this.currentTurn) + 1;
    let nextPlayer = '';
    if (list[nextIndex]) {
      nextPlayer = list[nextIndex];
    } else {
      nextPlayer = list[0];
    }

    this._gameService.setPlayers(this.players);

    const tempPlayers = this.players;

    // delete currentPlayer from old
    delete tempPlayers[this.currentTurn].currentPlayer;
    // add currentPlayer to next
    tempPlayers[nextPlayer].currentPlayer = true;

    this.currentTurn = nextPlayer;
    this.players = tempPlayers;
    this.db.updatePlayers(this.id, this.players).then(() => {
      console.log("getNextPlayer -- updated players successfully: ", this.players);
    });
  }

  removeStacks() {
    let removedArray;
    console.log("BEFORE: " + this.stacks);
    if (this.stacks.length == 9) {
      const removedArray = this.stacks.splice(this.stacks.length - 3, 3);
      console.log("Removing: ", removedArray);
    } else if (this.stacks.length == 6) {
      const removedArray = this.stacks.splice(this.stacks.length - 3, 2);
      console.log("Removing: ", removedArray);
    } else {
      const removedArray = this.stacks.splice(this.stacks.length - 3, 1);
      console.log("Removing: ", removedArray);
    }
    removedArray.forEach(card => {
      for (const c in card) {
        this.deck.push(card[c]);
      }
    });
    this._gameService.shuffle(this.deck);
  }
}
