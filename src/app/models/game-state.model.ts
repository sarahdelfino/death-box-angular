

export type Suit = 'H' | 'D' | 'C' | 'S' | 'JOKER';
export type GuessDirection = 'higher' | 'lower';

export interface Card {
  value: number; 
  suit: Suit;
  cardName: string; 
  cardPath: string; 
  tilt?: number;
}

export interface CardStack {
  cards: Card[];
}


export type StackGrid = {
  [position: string]: CardStack; 
};



export interface Player {
  id: string;
  name: string;
  secondsDrank: number; 
  correctGuesses: number;
  isHost?: boolean;
}

export interface GameStats {
  [playerId: string]: {
    assigned: number;
    actual: number;
  };
}



export interface GameState {
  id: string;
  status: 'waiting' | 'active' | 'finished';
  createdAt: number;
  currentTurn: string; 
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
  stats?: GameStats;
  dumb?: string | null;
}
