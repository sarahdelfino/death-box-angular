import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { GameBackendService } from './services/game-backend.service';
import { GameState, Card, StackGrid, Player } from './models/game-state.model';
import { forkJoin, map, of, switchMap, tap } from 'rxjs';

export interface GameStoreState {
  gameId: string | null;
  game: GameState | null;
  loading: boolean;
  error: string | null;
    messages: Record<string, { message: string; player: string }> | null;
}

export interface ChatMessage {
  key: string;
  player: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class GameStore extends ComponentStore<GameStoreState> {
  private backend = inject(GameBackendService);
  private injector = inject(EnvironmentInjector);

  constructor() {
    super({
      gameId: null,
      game: null,
      loading: false,
      error: null,
      messages: null,
    });
  }

  // === SELECTORS ===
  readonly game$ = this.select(s => s.game);
  readonly loading$ = this.select(s => s.loading);
  readonly error$ = this.select(s => s.error);
  readonly messages$ = this.select(s => s.gameId).pipe(
    switchMap(gameId =>
      gameId
        ? runInInjectionContext(this.injector, () =>
            this.backend.getMessages(gameId) // <- AngularFire call here
          )
        : of<Record<string, { message: string; player: string }>>({})
    ),
    map(obj =>
      Object.entries(obj ?? {})
        .map(([key, val]) => ({ key, player: val.player, message: val.message }))
        .sort((a, b) => a.key.localeCompare(b.key)) // oldest -> newest
    )
  );


  // === UPDATERS ===
  readonly setGameId = this.updater((state, gameId: string) => ({ ...state, gameId }));
  readonly setLoading = this.updater((state, loading: boolean) => ({ ...state, loading }));
  readonly setError = this.updater((state, error: string | null) => ({ ...state, error }));
  readonly setGame = this.updater((state, game: GameState | null) => ({ ...state, game }));
    readonly setMessages = this.updater(
    (state, messages: Record<string, { message: string; player: string }> | null) => ({
      ...state,
      messages,
    })
  );

  // === EFFECT: LOAD GAME ===
  readonly loadGame = this.effect<string>(gameId$ =>
    gameId$.pipe(
      tap(() => this.setLoading(true)),
      switchMap(gameId =>
        this.backend.getGame(gameId).pipe(
          tap({
            next: (game) => {
              this.setGameId(gameId);
              this.setGame(game);
              this.setError(null);
              this.setLoading(false);
            },
            error: (err) => {
              console.error(err);
              this.setError('Failed to load game');
              this.setLoading(false);
            }
          })
        )
      )
    )
  );

  // === EFFECT: CREATE GAME ===
readonly createGame = this.effect<{ gameId: string, playerName: string }>(params$ =>
  params$.pipe(
    switchMap(({ gameId, playerName }) =>
      this.backend.createGameWithHost(gameId, playerName).pipe(
        tap({
          next: (initialGame) => {
            this.setGameId(gameId);
            this.setGame(initialGame);
            this.setError(null);
            this.setLoading(false);
          },
          error: (err) => {
            console.error(err);
            this.setError('Failed to create game');
            this.setLoading(false);
          }
        })
      )
    )
  )
);

  // === EFFECT: ADD PLAYER ===
  readonly addPlayer = this.effect<{ gameId: string, playerName: string }>(params$ =>
    params$.pipe(
      switchMap(({ gameId, playerName }) =>
        this.backend.addPlayer(gameId, playerName)
      )
    )
  );

  // === EFFECT: START GAME ===
readonly startGame = this.effect<string>(gameId$ =>
  gameId$.pipe(
    switchMap(gameId =>
      this.backend.setStart(gameId).pipe(
        tap({
          next: (updatedGame) => {
            // Store full updated state: status + deck + stackGrid
            this.setGameId(gameId);
            this.setGame(updatedGame);
            this.setError(null);
          },
          error: (err) => {
            console.error(err);
            this.setError('Failed to start game');
          }
        })
      )
    )
  )
);

  // === EFFECT: SET CURRENT TURN ===
readonly setCurrentTurnAndResetGuesses = this.effect<{
  gameId: string;
  newPlayerId: string;
  oldPlayerId: string;
}>(input$ =>
  input$.pipe(
    switchMap(({ gameId, newPlayerId, oldPlayerId }) =>
      forkJoin([
        this.backend.resetGuesses(gameId, oldPlayerId),
        this.backend.setCurrentTurn(gameId, newPlayerId),
      ])
    )
  )
);

  // === EFFECT: DECK & STACK GRID ===
  readonly updateDeck = this.effect<{ gameId: string; deck: Card[] }>(
    input$ => input$.pipe(
      switchMap(({ gameId, deck }) => this.backend.updateDeck(gameId, deck))
    )
  );

  readonly updateStackGrid = this.effect<{ gameId: string; grid: StackGrid }>(
    input$ => input$.pipe(
      switchMap(({ gameId, grid }) => this.backend.updateStackGrid(gameId, grid))
    )
  );

  // === EFFECT: PLAYERS ===
  readonly updatePlayers = this.effect<{ gameId: string; players: Record<string, Player> }>(
    input$ => input$.pipe(
      switchMap(({ gameId, players }) => this.backend.updatePlayers(gameId, players))
    )
  );

  // === EFFECT: COUNTING / TIMER ===
  readonly updateCounting = this.effect<{ gameId: string; counting: boolean }>(input$ =>
    input$.pipe(
      switchMap(({ gameId, counting }) => this.backend.updateCounting(gameId, counting))
    )
  );

  readonly updateGameSecondsAndCounting = this.effect<{ gameId: string; seconds?: number }>(input$ =>
    input$.pipe(
      switchMap(({ gameId, seconds }) => this.backend.updateGameSecondsAndCounting(gameId, seconds))
    )
  );

  readonly endCounting = this.effect<string>(gameId$ =>
    gameId$.pipe(
      switchMap(gameId => this.backend.endCounting(gameId))
    )
  );

  readonly decrementSeconds = this.effect<string>(gameId$ =>
    gameId$.pipe(
      switchMap(gameId => this.backend.decrementSeconds(gameId))
    )
  );

  readonly incrementPlayerSeconds = this.effect<{ gameId: string; playerId: string; seconds: number }>(input$ =>
    input$.pipe(
      switchMap(({ gameId, playerId, seconds }) =>
        this.backend.incrementSeconds(gameId, playerId, seconds)
      )
    )
  );

  // === EFFECT: COUNTER ===
  readonly setCounter = this.effect<{ gameId: string; name: string }>(input$ =>
    input$.pipe(
      switchMap(({ gameId, name }) => this.backend.setCounter(gameId, name))
    )
  );

  // === EFFECT: MESSAGES ===
readonly sendMessage = this.effect<{ gameId: string; player: string; message: string; timestamp: string }>(input$ =>
  input$.pipe(
    switchMap(({ gameId, player, message, timestamp }) =>
      runInInjectionContext(this.injector, () =>
        this.backend.sendMessage(gameId, message, player, timestamp)
      )
    )
  )
);

readonly loadMessages = this.effect<string>(gameId$ =>
    gameId$.pipe(
      switchMap(gameId =>
        runInInjectionContext(this.injector, () =>
          this.backend.getMessages(gameId)
        ).pipe(
          tap(messages => this.setMessages(messages))
        )
      )
    )
  );
}
