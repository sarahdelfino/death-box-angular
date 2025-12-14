import {
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
  inject,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameStore } from '../game.store';
import { Card, StackGrid, Player } from '../models/game-state.model';
import { take } from 'rxjs';
import { NavbarComponent } from '../navbar/navbar.component';
import { CountComponent } from '../count/count.component';
import { CommonModule } from '@angular/common';
import { StackComponent } from '../stack/stack.component';
import { MessagesComponent } from '../messages/messages.component';
import { DeckComponent } from '../deck/deck.component';
import { ScoreboardComponent } from '../scoreboard/scoreboard.component';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { RulesComponent } from '../rules/rules.component';

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
    ScoreboardComponent,
    RulesComponent
  ],
  providers: [GameStore],
})
export class GameComponent implements OnDestroy {
  private route = inject(ActivatedRoute);
  readonly store = inject(GameStore);
  private analytics = inject(Analytics);

  @ViewChild('deckEl', { read: ElementRef }) deckEl!: ElementRef;
  @ViewChildren(StackComponent) stacks!: QueryList<StackComponent>;


  showCount = false;


  private wasCounting = false;

  flyingStyle: { top: string; left: string; transform: string } = {
    top: '0px',
    left: '0px',
    transform: 'translate(0,0)',
  };


  game$ = this.store.game$;
  loading$ = this.store.loading$;
  error$ = this.store.error$;


  sessionPlayer = sessionStorage.getItem('player');
  isHost = sessionStorage.getItem('host') === 'true';
  isMobile = window.innerWidth < 500;
  isResolving = false;


  gameId = this.route.snapshot.paramMap.get('id');
  cardSelected = false;
  messagesClicked = false;
  playersView = false;
  choice: 'higher' | 'lower' | null = null;
  selectedCard: Card | null = null;
  counting = false;
  unreadMessages = false;
  activeTab: 'chat' | 'howto' | 'scoreboard' = 'chat';
  wrongCardId: string | null = null;

  clickedData: {
    clickedCard: Card;
    stackKey: string;
    stackLength: number;
  } | null = null;

  deck: Card[] = [];
  newCard: Card | null = null;
  lastAddedCardId: string | null = null;
  flyingCard: Card | null = null;
  player_count: Number = 0;

  constructor() {
    if (this.gameId) {
      this.store.loadGame(this.gameId);

      this.store.game$.subscribe((game) => {
        if (!game) return;

        this.deck = game.deck;
        this.counting = game.counting;


        if (game.counting) {
          this.showCount = true;
        }


        if (game.counting && !this.wasCounting) {
          this.moveTopJokerToBottom(game);


        }
        this.wasCounting = game.counting;

        const currentDrinker = game.currentTurn;
        const players = Object.keys(game.players);
        this.player_count = players.length;

        if (game.players[currentDrinker].correctGuesses === 3) {
          const currentIndex = players.indexOf(currentDrinker);
          const nextIndex = (currentIndex + 1) % players.length;
          const nextDrinker = players[nextIndex];
          this.store.setCurrentTurnAndResetGuesses({
            gameId: game.id,
            newPlayerId: nextDrinker,
            oldPlayerId: currentDrinker,
          });
        }
      });
    }
  }

  onCountFinished(): void {
    this.showCount = false;
  }

  ngOnDestroy(): void {
    logEvent(this.analytics, 'left_during_game', {
      game_id: this.gameId,
      deck_size: this.deck?.length ?? 0,
      player_count: Number(this.player_count) ?? 0,
    });
  }


  toggleMessages() {
    this.messagesClicked = !this.messagesClicked;
    if (this.messagesClicked) this.unreadMessages = false;
  }

  toggleScores() {
    this.playersView = !this.playersView;
  }

  chooseCard(card: Card, deck: Card[], stackGrid: StackGrid) {
    const gameId = this.route.snapshot.paramMap.get('id');
    if (!gameId || !this.sessionPlayer) return;

    this.selectedCard = card;

    if (deck && deck.length > 0) {
      const stackKey = Object.keys(stackGrid).find((key) =>
        stackGrid[key].cards.some((c) => c.cardName === card.cardName)
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
    if (this.isResolving) return;
    if (this.deck.length === 0 || !this.clickedData) return;

    this.isResolving = true;
    this.choice = prediction;
    const gameId = this.route.snapshot.paramMap.get('id')!;
    if (this.deck.length === 0 || !this.clickedData) return;

    this.choice = prediction;
    const drawCard = this.deck.shift()!;
    drawCard.tilt = Math.random() * 12 - 6;
    this.flyingCard = drawCard;

    const { stackKey } = this.clickedData;

    const deckRect = this.deckEl.nativeElement.getBoundingClientRect();
    const stackCmp = this.stacks.find((cmp) => cmp.id === stackKey);
    if (!stackCmp) return;

    const stackRect = stackCmp.el.nativeElement.getBoundingClientRect();

    const deckCenterX = deckRect.left + deckRect.width / 2;
    const deckCenterY = deckRect.top + deckRect.height / 2;
    const stackCenterX = stackRect.left + stackRect.width / 2;
    const stackCenterY = stackRect.top + stackRect.height / 2;

    this.flyingStyle = {
      top: `${deckCenterY - 70}px`,
      left: `${deckCenterX - 50}px`,
      transform: 'translate(0,0)',
    };

    const dx = stackCenterX - deckCenterX;
    const dy = stackCenterY - deckCenterY;
    const tilt = drawCard.tilt ?? 0;

    requestAnimationFrame(() => {
      this.flyingStyle = {
        ...this.flyingStyle,
        transform: `translate(${dx}px, ${dy}px) rotateZ(${tilt}deg)`,
      };
    });

    setTimeout(() => {
      this.flyingCard = null;

      this.store.game$.pipe(take(1)).subscribe((current) => {
        if (!current) return;


        const newGrid: StackGrid = { ...current.stackGrid };
        newGrid[stackKey] = { cards: [drawCard, ...newGrid[stackKey].cards] };

        this.store.updateStackGrid({ gameId, grid: newGrid });
        this.store.updateDeck({ gameId, deck: this.deck });

        this.lastAddedCardId = drawCard.cardName;
        setTimeout(() => (this.lastAddedCardId = null), 600);
      });

      this.compareCards(drawCard);
    }, 200);
  }

  isCorrectGuess(
    drawn: { value: number; suit: string },
    clicked: { value: number },
    choice: 'higher' | 'lower'
  ): boolean {
    const isJoker = drawn.suit === 'JOKER';
    if (isJoker) return false;

    if (choice === 'higher') return drawn.value > clicked.value;
    return drawn.value < clicked.value;
  }


  private moveTopJokerToBottom(game: any) {
    const grid: StackGrid = { ...game.stackGrid };

    Object.keys(grid).forEach((stackKey) => {
      const cards = [...(grid[stackKey].cards ?? [])];
      if (!cards.length) return;

      const top = cards[0];
      if (top?.suit === 'JOKER') {
        cards.shift();
        cards.push(top);
        grid[stackKey] = { cards };
      }
    });

    this.store.updateStackGrid({ gameId: game.id, grid });
  }

  compareCards(drawnCard: any) {
    if (!this.clickedData || !this.choice) return;
    const gameId = this.route.snapshot.paramMap.get('id');
    if (!gameId || !this.sessionPlayer) return;

    const { clickedCard } = this.clickedData;
    const correctGuess = this.isCorrectGuess(drawnCard, clickedCard, this.choice);

    this.lastAddedCardId = drawnCard.cardName;

    if (!correctGuess) {
      this.wrongCardId = drawnCard.cardName;
      setTimeout(() => {
        if (this.wrongCardId === drawnCard.cardName) this.wrongCardId = null;
      }, 1200);
    } else {
      this.wrongCardId = null;
    }

    this.store.game$.pipe(take(1)).subscribe((current) => {
      if (!current) return;

      if (!correctGuess) {
        setTimeout(() => {
          this.store.updateGameSecondsAndCounting({
            gameId,
            seconds: this.clickedData!.stackLength + 1,
          });

          const updatedPlayers: Record<string, Player> = {
            ...current.players,
            [this.sessionPlayer!]: {
              ...current.players[this.sessionPlayer!],
              secondsDrank:
                current.players[this.sessionPlayer!].secondsDrank +
                (current.seconds ?? 0),
            },
          };
          this.store.updatePlayers({ gameId, players: updatedPlayers });

          setTimeout(() => {
            this.lastAddedCardId = null;
            this.cardSelected = false;
            this.clickedData = null;
            this.choice = null;
            this.selectedCard = null;
            this.wrongCardId = null;
            this.isResolving = false;
          }, 600);
        }, 900);
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
          const players = Object.keys(current.players);
          const currentIndex = players.indexOf(current.currentTurn);
          const nextIndex = (currentIndex + 1) % players.length;
          const nextPlayer = players[nextIndex];

          this.store.setCurrentTurnAndResetGuesses({
            gameId,
            newPlayerId: nextPlayer,
            oldPlayerId: current.currentTurn,
          });

          this.cardSelected = false;
          this.clickedData = null;
          this.choice = null;
          this.selectedCard = null;
          this.isResolving = false;
        } else {
          this.choice = null;
          this.isResolving = false;
        }
      }
    });
  }

  removeStacks(stackGrid: StackGrid) {
    const gameId = this.route.snapshot.paramMap.get('id');
    if (!gameId) return;

    const stacks = Object.entries(stackGrid);
    const sorted = stacks.sort((a, b) => b[1].cards.length - a[1].cards.length);
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

  decrementTimer() {
    const gameId = this.route.snapshot.paramMap.get('id');
    if (gameId) this.store.decrementSeconds(gameId);
  }

  endCounting() {
    const gameId = this.route.snapshot.paramMap.get('id');
    if (gameId) this.store.endCounting(gameId);
  }

  setActiveTab(tab: 'chat' | 'scoreboard' | 'howto') {
    this.activeTab = tab;
  }

  isChatActive(): boolean {
    return this.activeTab === 'chat';
  }

  isScoreboardActive(): boolean {
    return this.activeTab === 'scoreboard';
  }

  isHowToActive(): boolean {
    return this.activeTab === 'howto';
  }
}