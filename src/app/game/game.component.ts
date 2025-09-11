import { Component, OnInit, AfterViewInit, ViewChild, ViewChildren } from '@angular/core';
import { animate, state, keyframes, style, transition, trigger } from '@angular/animations';
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
    // trigger('openClose', [
    //   state('open', style({
    //     transform: 'translateY(0px)'
    //   })),
    //   state('closed', style({
    //     transform: 'translateY(200px)'
    //   })),
    //   state('void', style({
    //     transform: 'translateY(200px)'
    //   })),
    //   transition('open <=> closed', [
    //     animate('.25s')
    //   ]),
    //   transition(':enter', [
    //     animate('.25s ease-in')
    //   ]),
    //   transition(':leave', [
    //     animate('.25s .25s ease-out')
    //   ]),
    // ]),
    trigger('removeStacks', [
      transition(':leave',
        animate('1s', keyframes([
          style({'opacity': '1'}),
          style({'opacity': '.5'}),
          style({'opacity': '0'})
        ]))
      )
    ])
  ],
})
export class GameComponent implements OnInit, AfterViewInit {

  @ViewChild(StackComponent) stackChild: StackComponent;
  @ViewChild('test') child: HTMLElement;
  @ViewChildren(StackComponent) stackChildren: StackComponent;
  @ViewChildren(StackComponent) children;

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
  ) {}


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
    };
    this.db.getDeck(this.id).valueChanges().subscribe(deckData => {
      this.deck = deckData;
    })
    this.db.getStacks(this.id).valueChanges().subscribe(stackData => {
      this.stacks = stackData;
    });
    this.db.getGame(this.id).valueChanges().subscribe(gameData => {
      this.game = gameData;
      this.game.id = this.id;
      this.game.counting = gameData.counting;
      this.game.counter = gameData.counter;
      this.game.players = gameData.players;
      this.game.seconds = gameData.seconds;
      this.game.started = gameData.started;
      const tmpPlayers = [];
      for (const p in gameData.players) {
        if (gameData.players[p].currentPlayer) {
          this.currentTurn = p;
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
  }

  ngAfterViewInit() {
    console.log(this.child);
    console.log(this.stackChildren);
    console.log(this.children);
    this.children.map((x) => {
      if(x.id === 8) {
        console.log(x);
      }
    })
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
    // this.children.map((selectedStack) => {
    //   console.log("#####################", selectedStack);
    // });
    // const timer = setTimeout(() => {
    // }, 1000);
    this.db.updateDeck(this.id, this.deck);
    this.checkDeck();
    // this.checkDeck();
  }

  cardChoice(ch: string) {
    this.choice = ch;
  }

  chooseCard(card: Card) {
    if (this.deck.length > 1) {
      const clickedCard = card[0];
      const newCard = this.deck.pop();
      const i = this.stacks.indexOf(card);
      const stackLength = this.stacks[i].length;
      const gameId = this.getId();
      this.clickedData = { clickedCard, newCard, stackLength, gameId };
      this.cardSelected = true;
    } else {
      this.removeStacks();
    }
  }

  goBack() {
    this.cardSelected = false;
  }

  count() {
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
    const curCountIndex = this.filteredPlayers.indexOf(currentCounter);
    let newIndex = curCountIndex + 1;
    if (newIndex == this.filteredPlayers.length) {
      newIndex = 0;
    }
    this.currentCounter = this.filteredPlayers[newIndex];
    this.db.setCounter(this.game.id, this.currentCounter).then(() => {
      console.log("set counter successfully: ", this.currentCounter);
    });
  }

  endCounting(card: any) {
    this.deck.push(card);
    this._gameService.shuffle(this.deck);
    this.cardSelected = false;
  }

  removeStacks() {
    let removedArray;
    console.log("BEFORE: " + this.stacks);
    if (this.stacks.length == 9) {
      removedArray = this.stacks.splice(this.stacks.length - 3, 3);
      alert(`Removing: ${removedArray}`)
      console.log("Removing: ", removedArray);
    } else if (this.stacks.length == 6) {
      removedArray = this.stacks.splice(this.stacks.length - 2, 2);
      // let tmp = this.stacks.splice(this.stacks.length,)
      alert(`Removing: ${removedArray}`)
      console.log("Removing: ", removedArray);
    } else {
      removedArray = this.stacks.splice(this.stacks.length - 3, 1);
      alert(`Removing: ${removedArray}`)
      console.log("Removing: ", removedArray);
    }
    console.log(removedArray)
    removedArray.forEach(card => {
      for (const c in card) {
        this.deck.push(card[c]);
      }
    });
    this.db.updateStacks(this.id, this.stacks).then(() => {
      console.log("successfully updated stacks", this.stacks);
    })
    this.db.updateDeck(this.id, this.deck);
    this._gameService.shuffle(this.deck);
    console.log(this.deck.length);
  }

  checkDeck() {
    console.log("hi");
    if (this.deck.length < 42) {
      this.removeStacks();
    }
    this.db.updateStacks(this.id, this.stacks);
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
        this.cardSelected = false;
      }
    }
  }

  getNextPlayer() {
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
}
