import { Component, ElementRef, QueryList, ViewChild, ViewChildren, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameStore } from '../game.store';
import { Card, StackGrid, Player, GameState } from '../models/game-state.model';
import { of, take } from 'rxjs';
import { NavbarComponent } from '../navbar/navbar.component';
import { CountComponent } from '../count/count.component';
import { CommonModule } from '@angular/common';
import { StackComponent } from '../stack/stack.component';
import { MessagesComponent } from '../messages/messages.component';
import { DeckComponent } from '../deck/deck.component';
import { ScoreboardComponent } from "../scoreboard/scoreboard.component";
import { Analytics, logEvent } from '@angular/fire/analytics';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    CountComponent,
    DeckComponent,
    StackComponent,
    MessagesComponent,
    ScoreboardComponent
  ],
  providers: [GameStore],
})
export class GameComponent {
  private route = inject(ActivatedRoute);
  readonly store = inject(GameStore);
  private analytics = inject(Analytics);

  @ViewChild('deckEl', { read: ElementRef }) deckEl!: ElementRef;
  @ViewChildren(StackComponent) stacks!: QueryList<StackComponent>;

  flyingStyle: { top: string; left: string; transform: string } = {
    top: '0px',
    left: '0px',
    transform: 'translate(0,0)',
  };

  cardTransform = 'translate(0,0)';

  // === Reactive state ===
  game$ = this.store.game$;
  loading$ = this.store.loading$;
  error$ = this.store.error$;

  // === Session state ===
  sessionPlayer = sessionStorage.getItem('player');
  isHost = sessionStorage.getItem('host') === 'true';
  isMobile = window.innerWidth < 500;

  // === UI flags ===
  gameId = this.route.snapshot.paramMap.get('id');
  cardSelected = false;
  messagesClicked = false;
  playersView = false;
  choice: 'higher' | 'lower' | null = null;
  selectedCard: Card | null = null;
  counting = false;
  unreadMessages = false;
  activeTab: 'chat' | 'scoreboard' = 'chat';

  clickedData: {
    clickedCard: Card;
    // newCard: Card;
    stackKey: string;
    stackLength: number;
  } | null = null;

  deck: Card[] = [];
  newCard: Card | null = null;
  lastAddedCardId: string | null = null;
  flyingCard: Card | null = null;
  flyingTransform = 'translate(0,0)';
  player_count: Number = 0;

  constructor() {
    if (this.gameId) {
      this.store.loadGame(this.gameId);
      this.store.game$.subscribe(game => {
        if (game) {
          this.deck = game.deck;
          this.counting = game.counting;
          let currentDrinker = game.currentTurn
          let players = Object.keys(game.players);
          this.player_count = players.length;
          if (game.players[currentDrinker].correctGuesses === 3) {
            let currentIndex = players.indexOf(currentDrinker);
            let nextIndex = (currentIndex + 1) % players.length;
            let nextDrinker = players[nextIndex];
            this.store.setCurrentTurnAndResetGuesses({ gameId: game.id, newPlayerId: nextDrinker, oldPlayerId: currentDrinker });
          }
        }
      })
    }
  }

  ngOnDestroy(): void {
    logEvent(this.analytics, 'left_during_game', {
      game_id: this.gameId,
      deck_size: this.deck?.length ?? 0,
      player_count: Number(this.player_count) ?? 0,
    });
  }

  // === UI Actions ===
  toggleMessages() {
    this.messagesClicked = !this.messagesClicked;
    if (this.messagesClicked) {
      this.unreadMessages = false;
    }
  }

  toggleScores() {
    this.playersView = !this.playersView;
  }

  chooseCard(card: Card, deck: Card[], stackGrid: StackGrid) {
    const gameId = this.route.snapshot.paramMap.get('id');
    if (!gameId || !this.sessionPlayer) return;

    this.selectedCard = card;

    if (deck && deck.length > 0) {
      // Find which stack the clicked card belongs to
      const stackKey = Object.keys(stackGrid).find(
        key => stackGrid[key].cards.some(c => c.cardName === card.cardName)
      );
      if (!stackKey) return;

      this.clickedData = {
        clickedCard: card,
        stackKey,
        stackLength: stackGrid[stackKey].cards.length,
      };
    } else {
      this.removeStacks(stackGrid);
    }
  }

  drawFromDeck(prediction: 'higher' | 'lower') {
    const gameId = this.route.snapshot.paramMap.get('id')!;
    if (this.deck.length === 0 || !this.clickedData) return;

    this.choice = prediction;
    const drawCard = this.deck.shift()!;
    drawCard.tilt = Math.random() * 12 - 6;
    this.flyingCard = drawCard;

    const { stackKey } = this.clickedData;

    const deckRect = this.deckEl.nativeElement.getBoundingClientRect();
    const stackCmp = this.stacks.find(cmp => cmp.id === stackKey);
    if (!stackCmp) return;

    const stackRect = stackCmp.el.nativeElement.getBoundingClientRect();

    // centers
    const deckCenterX = deckRect.left + deckRect.width / 2;
    const deckCenterY = deckRect.top + deckRect.height / 2;
    const stackCenterX = stackRect.left + stackRect.width / 2;
    const stackCenterY = stackRect.top + stackRect.height / 2;

    // set starting position
    this.flyingStyle = {
      top: `${deckCenterY - 70}px`,   // 70 = half of card height (140px)
      left: `${deckCenterX - 50}px`,  // 50 = half of card width (100px)
      transform: 'translate(0,0)',
    };

    // target offsets
    const dx = stackCenterX - deckCenterX;
    const dy = stackCenterY - deckCenterY;
    const tilt = drawCard.tilt ?? 0;

    // animate
    requestAnimationFrame(() => {
      this.flyingStyle = {
        ...this.flyingStyle,
        transform: `translate(${dx}px, ${dy}px) rotateZ(${tilt}deg)`,
      };
    });

    // after flight
    setTimeout(() => {
      this.flyingCard = null;

      this.store.game$.pipe(take(1)).subscribe(current => {
        if (!current) return;
        const newGrid: StackGrid = { ...current.stackGrid };
        newGrid[stackKey] = { cards: [drawCard, ...newGrid[stackKey].cards] };

        this.store.updateStackGrid({ gameId, grid: newGrid });
        this.store.updateDeck({ gameId, deck: this.deck });

        this.lastAddedCardId = drawCard.cardName;
        setTimeout(() => (this.lastAddedCardId = null), 600);
      });

      this.compareCards(drawCard);
    }, 600);
  }
  compareCards(drawnCard: any) {
    if (!this.clickedData || !this.choice) return;
    const gameId = this.route.snapshot.paramMap.get('id');
    if (!gameId || !this.sessionPlayer) return;

    const { clickedCard, stackKey } = this.clickedData;

    const higher = drawnCard.value > clickedCard.value;
    const lower = drawnCard.value < clickedCard.value;
    const correctGuess =
      (this.choice === 'higher' && higher) ||
      (this.choice === 'lower' && lower);

    this.store.game$.pipe(take(1)).subscribe((current) => {
      if (!current) return;
      const newGrid: StackGrid = { ...current.stackGrid };
      newGrid[stackKey] = {
        cards: [drawnCard, ...newGrid[stackKey].cards],
      };

      setTimeout(() => {
        this.lastAddedCardId = null;
        this.cardSelected = false;
        this.clickedData = null;
        this.choice = null;
        this.selectedCard = null;
      }, 600);

      if (!correctGuess) {
        this.store.updateGameSecondsAndCounting({ gameId, seconds: this.clickedData!.stackLength });
        const updatedPlayers: Record<string, Player> = {
          ...current.players,
          [this.sessionPlayer!]: {
            ...current.players[this.sessionPlayer!],
            secondsDrank: current.players[this.sessionPlayer!].secondsDrank + (current.seconds ?? 0),
          },
        };
        this.store.updatePlayers({ gameId, players: updatedPlayers });
      } else {
        const turns =
          (current.players[this.sessionPlayer!]?.correctGuesses ?? 0) + 1;

        const updatedPlayers: Record<string, Player> = {
          ...current.players,
          [this.sessionPlayer!]: {
            ...current.players[this.sessionPlayer!],
            correctGuesses: turns,
          },
        };
        this.store.updatePlayers({ gameId, players: updatedPlayers });
        if (turns === 3) {
          // alert(`You've survived this round! The next player is up.`);
          const players = Object.keys(current.players);
          const currentIndex = players.indexOf(current.currentTurn);
          const nextIndex = (currentIndex + 1) % players.length;
          const nextPlayer = players[nextIndex];

          this.store.setCurrentTurnAndResetGuesses({ gameId, newPlayerId: nextPlayer, oldPlayerId: current.currentTurn });

          // Set the counter for the next player
          // this.getNextCounter(nextPlayer);
          // this.store.setCounter({ gameId: gameId, name: nextPlayer})

          // Reset local UI state
          this.cardSelected = false;
          this.clickedData = null;
          this.choice = null;
          this.selectedCard = null;
        }
      }
    });
  }

  removeStacks(stackGrid: StackGrid) {
    const gameId = this.route.snapshot.paramMap.get('id');
    if (!gameId) return;

    const stacks = Object.entries(stackGrid);
    const sorted = stacks.sort(
      (a, b) => b[1].cards.length - a[1].cards.length
    );
    const toRemove = sorted.slice(0, 3);

    let newDeck: Card[] = [];
    const newGrid: StackGrid = { ...stackGrid };

    toRemove.forEach(([key, stack]) => {
      newDeck.push(...stack.cards);
      newGrid[key] = { cards: [] };
    });

    this.store.updateStackGrid({ gameId, grid: newGrid });
    this.store.updateDeck({ gameId, deck: newDeck });
  }

  endHighLow(wrongGuess: boolean, stackGrid: StackGrid) {
    if (!this.clickedData) return;
    const gameId = this.route.snapshot.paramMap.get('id');
    if (!gameId || !this.sessionPlayer) return;

    const { clickedCard, stackKey } = this.clickedData;

    const newGrid: StackGrid = { ...stackGrid };
    newGrid[stackKey] = {
      cards: [...newGrid[stackKey].cards],
    };

    this.store.updateStackGrid({ gameId, grid: newGrid });

    if (!wrongGuess) {
      this.store.game$.pipe(take(1)).subscribe((current) => {
        if (!current) return;
        const turns =
          (current.players[this.sessionPlayer!]?.correctGuesses ?? 0) + 1;

        const updatedPlayers: Record<string, Player> = {
          ...current.players,
          [this.sessionPlayer!]: {
            ...current.players[this.sessionPlayer!],
            correctGuesses: turns,
          },
        };
        this.store.updatePlayers({ gameId, players: updatedPlayers });
      });
    }

    this.cardSelected = false;
    this.clickedData = null;
  }

  // === Counting logic ===
  decrementTimer() {
    const gameId = this.route.snapshot.paramMap.get('id');
    if (gameId) this.store.decrementSeconds(gameId);
  }

  endCounting() {
    const gameId = this.route.snapshot.paramMap.get('id');
    if (gameId) this.store.endCounting(gameId);
  }

  setActiveTab(tab: 'chat' | 'scoreboard') {
    this.activeTab = tab;
  }

  isChatActive(): boolean {
    return this.activeTab === 'chat';
  }

  isScoreboardActive(): boolean {
    return this.activeTab === 'scoreboard';
  }

}
