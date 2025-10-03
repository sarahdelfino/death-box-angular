// CARD & STACK TYPES

export type Suit = 'H' | 'D' | 'C' | 'S' | 'JOKER';
export type GuessDirection = 'higher' | 'lower';

export interface Card {
  value: number; // 1–13 for Ace–King, 0 or 14 for Jokers
  suit: Suit;
  cardName: string; // e.g. "5H", "13S", "JOKER"
  cardPath: string; // URL or local path to image asset
  tilt?: number;
}

export interface CardStack {
  cards: Card[];
}

// GAME GRID STRUCTURE
export type StackGrid = {
  [position: string]: CardStack; // position = "0-0", "1-2", etc.
};

// PLAYER TYPE

export interface Player {
  id: string;
  name: string;
  secondsDrank: number; // total seconds drank
  correctGuesses: number;
  isHost?: boolean;
}

// GAME STATE (DB Root Object)

export interface GameState {
  id: string;
  status: 'waiting' | 'active' | 'finished';
  createdAt: number;
  currentTurn: string; // playerId
  deck: Card[];
  stackGrid: StackGrid;
  counting: boolean;
  counter: string | null;
  messages: Record<string, { message: string; player: string }> | null;
  seconds: number | null;
  initialSeconds?: number | null;
  players: {
    [name: string]: Player
  }
  dumb?: string | null;
}
