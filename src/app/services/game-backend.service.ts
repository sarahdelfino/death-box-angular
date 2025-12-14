import { inject, Injectable } from '@angular/core';
import {
  Database,
  ref,
  set,
  update,
  objectVal,
  listVal,
  increment,
  get,
} from '@angular/fire/database';
import { from, map, switchMap } from 'rxjs';
import { GameState, Card, StackGrid, Player } from '../models/game-state.model';
import { dealInitialStacks, generateShuffledDeck, initEmptyStackGrid } from '../utils';

@Injectable({ providedIn: 'root' })
export class GameBackendService {

  private db: Database;

  constructor() {
    this.db = inject(Database);
  }

  

  getGame(gameId: string) {
    const gameRef = ref(this.db, `games/${gameId}`);
    return objectVal<GameState>(gameRef);
  }

  createGame(gameId: string, game: GameState) {
    const gameRef = ref(this.db, `games/${gameId}`);
    return from(set(gameRef, game));
  }

  /**
   * Create a game with the first host player included.
   */
createGameWithHost(gameId: string, hostName: string, dumb?: string) {
  if (dumb) {
    return from(Promise.reject(new Error('Bot detected')));
  }

  let deck = generateShuffledDeck(true);
  let stackGrid = initEmptyStackGrid();

  const dealt = dealInitialStacks(deck, stackGrid);
  deck = dealt.deck;
  stackGrid = dealt.stackGrid;

  const game: GameState = {
    id: gameId,
    createdAt: Date.now(),
    deck,
    stackGrid,
    players: {
      [hostName]: {
        id: hostName,
        name: hostName,
        secondsDrank: 0,
        correctGuesses: 0,
      },
    },
    messages: null,
    currentTurn: hostName,
    counter: null,
    status: 'waiting',
    seconds: null,
    counting: false,
    dumb: dumb ?? null 
  };

  const gameRef = ref(this.db, `games/${gameId}`);
  return from(set(gameRef, game)).pipe(map(() => game));
}



  deleteGame(gameId: string) {
    const gameRef = ref(this.db, `games/${gameId}`);
    return from(set(gameRef, null));
  }

  

  setDeck(gameId: string, deck: Card[]) {
    const deckRef = ref(this.db, `games/${gameId}/deck`);
    return from(set(deckRef, deck));
  }

  getDeck(gameId: string) {
    const deckRef = ref(this.db, `games/${gameId}/deck`);
    return listVal<Card>(deckRef);
  }

  updateDeck(gameId: string, deck: Card[]) {
    const deckRef = ref(this.db, `games/${gameId}/deck`);
    return from(set(deckRef, deck));
  }

  

  setStacks(gameId: string, stacks: StackGrid) {
    const stacksRef = ref(this.db, `games/${gameId}/stacks`);
    return from(set(stacksRef, stacks));
  }

  getStacks(gameId: string) {
    const stacksRef = ref(this.db, `games/${gameId}/stacks`);
    return objectVal<StackGrid>(stacksRef);
  }

  updateStackGrid(gameId: string, grid: StackGrid) {
    const gridRef = ref(this.db, `games/${gameId}/stackGrid`);
    return from(set(gridRef, grid));
  }

  updateStacks(gameId: string, stacks: StackGrid) {
    const stacksRef = ref(this.db, `games/${gameId}/stacks`);
    return from(set(stacksRef, stacks));
  }

  

addPlayer(gameId: string, playerName: string, dumb?: string) {
  if (dumb) {
    return from(Promise.reject(new Error('Bot detected')));
  }

  const newPlayer: Player = {
    id: playerName,
    name: playerName,
    secondsDrank: 0,
    correctGuesses: 0,
  };

  const playerRef = ref(this.db, `games/${gameId}/players/${playerName}`);
  return from(set(playerRef, newPlayer));
}

  getPlayers(gameId: string) {
    const playersRef = ref(this.db, `games/${gameId}/players`);
    return objectVal<Record<string, Player>>(playersRef);
  }

  updatePlayers(gameId: string, players: Record<string, Player>) {
    const playersRef = ref(this.db, `games/${gameId}/players`);
    return from(update(playersRef, players));
  }

  updatePlayer(gameId: string, playerId: string, player: Player) {
    const playerRef = ref(this.db, `games/${gameId}/players/${playerId}`);
    return from(set(playerRef, player));
  }

  setCurrentTurn(gameId: string, playerId: string) {
    const turnRef = ref(this.db, `games/${gameId}/currentTurn`);
    return from(set(turnRef, playerId));
  }

resetGuesses(gameId: string, playerId: string) {
  const guessesRef = ref(this.db, `games/${gameId}/players/${playerId}/correctGuesses`);
  return from(set(guessesRef, 0));
}

  getCurrentPlayer(gameId: string) {
    const currentRef = ref(this.db, `games/${gameId}/currentTurn`);
    return objectVal<string>(currentRef);
  }

  

  updateGameStatus(gameId: string, status: GameState['status']) {
    const statusRef = ref(this.db, `games/${gameId}/status`);
    return from(set(statusRef, status));
  }

setStart(gameId: string) {
  const gameRef = ref(this.db, `games/${gameId}`);
return from(get(gameRef)).pipe(
  map(snapshot => {
    const game = snapshot.val() as GameState | null;
    if (!game) throw new Error('Game not found');

    

    return {
      ...game,
      status: 'active',
    } as GameState;
  }),
  switchMap(updated =>
    from(update(gameRef, {
      status: updated.status,
      deck: updated.deck,
      stackGrid: updated.stackGrid,
    })).pipe(map(() => updated))
  )
);
}

  

  updateCounting(gameId: string, counting: boolean) {
    const refPath = ref(this.db, `games/${gameId}/counting`);
    return from(set(refPath, counting));
  }

  updateGameSecondsAndCounting(gameId: string, seconds?: number) {
    const gameRef = ref(this.db, `games/${gameId}`);
    return from(update(gameRef, { counting: true, seconds, initialSeconds: seconds }));
  }

  endCounting(gameId: string) {
    const gameRef = ref(this.db, `games/${gameId}`);
    return from(update(gameRef, { counting: null, seconds: null, counter: null }));
  }

  updateSeconds(gameId: string, seconds: number) {
    const secondsRef = ref(this.db, `games/${gameId}/seconds`);
    return from(set(secondsRef, seconds));
  }

  setCounter(gameId: string, name: string) {
    const counterRef = ref(this.db, `games/${gameId}/counter`);
    return from(set(counterRef, name));
  }

  

  sendMessage(gameId: string, message: string, player: string, timestamp: string) {
    const msgRef = ref(this.db, `messages/${gameId}/${timestamp}`);
    return from(set(msgRef, { message, player }));
  }

  getMessages(gameId: string) {
    const refPath = ref(this.db, `messages/${gameId}`);
    return objectVal<Record<string, { message: string; player: string }>>(refPath);
  }

  

  decrementSeconds(gameId: string) {
    const gameRef = ref(this.db, `games/${gameId}`);
    return from(update(gameRef, { seconds: increment(-1) }));
  }

  incrementSeconds(gameId: string, playerId: string, seconds: number) {
    const playerRef = ref(this.db, `games/${gameId}/players/${playerId}`);
    return from(update(playerRef, { secondsDrank: increment(seconds) }));
  }
}
