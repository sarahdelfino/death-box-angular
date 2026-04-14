import {
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameStore } from '../game.store';
import { Card, StackGrid, Player } from '../models/game-state.model';
import { take } from 'rxjs';
import { NavbarComponent } from '../navbar/navbar.component';
import { CountComponent } from '../count/count.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { StackComponent } from '../stack/stack.component';
import { MessagesComponent } from '../messages/messages.component';
import { DeckComponent } from '../deck/deck.component';
import { ScoreboardComponent } from '../scoreboard/scoreboard.component';
import { RulesComponent } from '../rules/rules.component';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { FirebaseApp } from '@angular/fire/app';

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
    RulesComponent,
  ],
  providers: [GameStore],
})
export class GameComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  readonly store = inject(GameStore);
  private platformId = inject(PLATFORM_ID);

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

  sessionPlayer: string | null = null;
  isHost = false;
  isMobile = false;
  isResolving = false;

  gameId: string | null = null;
  cardSelected = false;
  messagesClicked = false;
  playersView = false;
  choice: 'higher' | 'lower' | null = null;
  selectedCard: Card | null = null;
  counting = false;
  unreadMessages = false;
  activeTab: 'chat' | 'howto' | 'scoreboard' = 'chat';
  wrongCardId: string | null = null;
  debug = false;

  clickedData: {
    clickedCard: Card;
    stackKey: string;
    stackLength: number;
  } | null = null;

  deck: Card[] = [];
  newCard: Card | null = null;
  lastAddedCardId: string | null = null;
  flyingCard: Card | null = null;
  player_count: number = 0;

  // =========================================================
  // Rebuild queue + highlighting (penalty always wins)
  // =========================================================
  pendingRebuild: null | { stackKeys: string[]; reason: 'deck_empty' } = null;

  /** Expose to template to style stacks: isStackRemoving(stack.key) */
  removingStackKeys: string[] = [];
  private readonly REBUILD_HIGHLIGHT_MS = 1000;

  ngOnInit(): void {
    // ✅ SSR-safe reads
    if (isPlatformBrowser(this.platformId)) {
    window.addEventListener('keydown', this.onKeydown);
      this.sessionPlayer = sessionStorage.getItem('player');
      this.isHost = sessionStorage.getItem('host') === 'true';
      this.isMobile = window.innerWidth < 500;
    }

      this.route.queryParamMap.subscribe(q => {
    this.debug = q.get('debug') === '1';
  });

    this.gameId = this.route.snapshot.paramMap.get('id');

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

  private debugAllowed(): boolean {
  if (!isPlatformBrowser(this.platformId)) return false;
  if (!this.debug) return false;
  if (!this.gameId) return false;
  // optional but recommended:
  if (!this.isHost) return false;
  return true;
}

private setDeckLen(n: number): void {
  if (!this.debugAllowed()) return;

  const gameId = this.gameId!;
  const next = (this.deck ?? []).slice(0, Math.max(0, n));

  this.store.updateDeck({ gameId, deck: next });

  // keep local copy in sync immediately so your UI reacts right away
  this.deck = next;
}

debugDeck0(): void { this.setDeckLen(0); }
debugDeck1(): void { this.setDeckLen(1); }
debugDeck5(): void { this.setDeckLen(5); }


private onKeydown = (e: KeyboardEvent) => {
  if (!this.debugAllowed()) return;

  // D = deck 0, O = deck 1, F = deck 5
  if (e.key === 'd' || e.key === 'D') this.debugDeck0();
  if (e.key === 'o' || e.key === 'O') this.debugDeck1();
  if (e.key === 'f' || e.key === 'F') this.debugDeck5();
};

  onCountFinished(): void {
    this.showCount = false;
    this.maybeRunRebuildNow(); // ✅ rebuild happens AFTER penalty ends
  }

  ngOnDestroy(): void {
      if (isPlatformBrowser(this.platformId)) {
    window.removeEventListener('keydown', this.onKeydown);
  }
    this.logEvent('left_during_game', {
      game_id: this.gameId,
      deck_size: this.deck?.length ?? 0,
      player_count: this.player_count ?? 0,
    });
  }

  toggleMessages() {
    this.messagesClicked = !this.messagesClicked;
    if (this.messagesClicked) this.unreadMessages = false;
  }

  toggleScores() {
    this.playersView = !this.playersView;
  }

  // =========================================================
  // UI helper to style only the stacks being removed
  // =========================================================
  isStackRemoving(stackKey: string): boolean {
    return this.removingStackKeys.includes(stackKey);
  }

  // =========================================================
  // Rebuild logic (queued)
  // =========================================================

  /** Pick 3 stacks to remove (currently: 3 longest). */
  private computeStacksToRemove(stackGrid: StackGrid, excludeKey?: string): string[] {
    const entries = Object.entries(stackGrid)
      .filter(([key]) => !excludeKey || key !== excludeKey)
      .map(([key, stack]) => ({ key, len: (stack?.cards ?? []).length }));

    // sort desc by length, stable-ish
    entries.sort((a, b) => b.len - a.len);

    return entries.slice(0, 3).map((e) => e.key);
  }

  /** Schedule a rebuild but do not execute while counting / resolving. */
  private armPendingRebuild(stackGrid: StackGrid, opts?: { excludeKey?: string }): void {
    if (this.pendingRebuild) return; // already queued

    const stackKeys = this.computeStacksToRemove(stackGrid, opts?.excludeKey);

    // If there aren’t actually 3 usable stacks, bail quietly.
    // if (stackKeys.length < 3) return;

    this.pendingRebuild = { stackKeys, reason: 'deck_empty' };

    // Optional: immediately show the "these will be removed" highlight
    // ONLY if we aren’t currently counting.
    if (!this.showCount && !this.counting) {
      this.removingStackKeys = [...stackKeys];
    }
  }

  /** Only execute rebuild when it won't compete with penalty or in-flight animations. */
  private maybeRunRebuildNow(): void {
    if (!this.pendingRebuild) return;

    // penalty UI or penalty state active → wait
    if (this.showCount || this.counting) return;

    // still resolving a draw (card flying / compare in progress) → wait
    if (this.isResolving) return;

    const gameId = this.gameId;
    if (!gameId) return;

    const { stackKeys } = this.pendingRebuild;
    this.pendingRebuild = null;

    void this.rebuildDeckFromSpecificStacks(gameId, stackKeys);
  }

  /** Highlight → then actually remove stacks and rebuild deck. */
  private async rebuildDeckFromSpecificStacks(gameId: string, stackKeys: string[]): Promise<void> {
    // highlight
    setTimeout(() => (this.removingStackKeys = [...stackKeys]), 2000);
    // this.removingStackKeys = [...stackKeys];

    // short pause for visual cue (SSR-safe)
    if (isPlatformBrowser(this.platformId)) {
      await new Promise<void>((r) => setTimeout(r, this.REBUILD_HIGHLIGHT_MS));
    }

    this.store.game$.pipe(take(1)).subscribe((current) => {
      if (!current) return;

      const grid: StackGrid = { ...current.stackGrid };
      let newDeck: Card[] = [];

      for (const key of stackKeys) {
        const cards = [...(grid[key]?.cards ?? [])];
        if (cards.length) newDeck.push(...cards);
        grid[key] = { cards: [] };
      }

      // shuffle newDeck (simple Fisher–Yates)
      for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
      }

      // Persist
      this.store.updateStackGrid({ gameId, grid });
      this.store.updateDeck({ gameId, deck: newDeck });

      this.logEvent('deck_rebuilt', {
        game_id: gameId,
        taken_stacks: stackKeys.length,
        new_deck_size: newDeck.length,
      });

      // clear highlight shortly after
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => (this.removingStackKeys = []), 1500);
      } else {
        this.removingStackKeys = [];
      }
    });
  }

  // =========================================================
  // Gameplay
  // =========================================================

  chooseCard(card: Card, deck: Card[], stackGrid: StackGrid) {
    const gameId = this.route.snapshot.paramMap.get('id');
    if (!gameId || !this.sessionPlayer) return;

    this.selectedCard = card;

    // If deck is empty, arm rebuild (but do NOT execute during penalty/resolution)
    if (!deck || deck.length === 0) {
      this.armPendingRebuild(stackGrid);
      this.maybeRunRebuildNow();
      return;
    }

    const stackKey = Object.keys(stackGrid).find((key) =>
      stackGrid[key].cards.some((c) => c.cardName === card.cardName)
    );
    if (!stackKey) return;

    this.clickedData = {
      clickedCard: card,
      stackKey,
      stackLength: stackGrid[stackKey].cards.length,
    };
  }

  drawFromDeck(prediction: 'higher' | 'lower') {
    // ✅ This method uses DOM + RAF; keep it browser-only
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.isResolving) return;
    if (this.deck.length === 0 || !this.clickedData) return;

    this.isResolving = true;
    this.choice = prediction;

    const gameId = this.route.snapshot.paramMap.get('id')!;
    if (this.deck.length === 0 || !this.clickedData) return;

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

        // persist stack + deck
        this.store.updateStackGrid({ gameId, grid: newGrid });
        this.store.updateDeck({ gameId, deck: this.deck });

        this.lastAddedCardId = drawCard.cardName;
        setTimeout(() => (this.lastAddedCardId = null), 600);

        // ✅ If deck is now empty, ARM rebuild (do not run yet)
        if (this.deck.length === 0) {
          // optional: avoid pulling the stack you just played on
          // this.armPendingRebuild(newGrid, { excludeKey: stackKey });
          this.armPendingRebuild(newGrid);
        }
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
        // WRONG: penalty wins → rebuild waits for onCountFinished()
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

            // rebuild is queued; penalty UI will block it until count finishes
            this.maybeRunRebuildNow();
          }, 600);
        }, 900);
      } else {
        const turns = (current.players[this.sessionPlayer!]?.correctGuesses ?? 0) + 1;

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

          // correct path: if deck just emptied, rebuild can run now
          this.maybeRunRebuildNow();
        } else {
          this.choice = null;
          this.isResolving = false;

          // correct path: if deck just emptied, rebuild can run now
          this.maybeRunRebuildNow();
        }
      }
    });
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

  constructor(private firebaseApp: FirebaseApp) {}
  logEvent(name: string, params: Record<string, unknown>) {
    logEvent(getAnalytics(this.firebaseApp), name, params);
  }
}
