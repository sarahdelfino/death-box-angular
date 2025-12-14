import { Card, StackGrid, Suit, CardStack } from './models/game-state.model';


export function generateShuffledDeck(includeJokers = false): Card[] {
  const suits: Suit[] = ['H', 'D', 'C', 'S'];
  const values = Array.from({ length: 13 }, (_, i) => i + 1); 

  let deck: Card[] = [];

  for (const suit of suits) {
    for (const value of values) {
      deck.push({
        value,
        suit,
        cardName: `${value}${suit}`,
        cardPath: `/assets/cards/${value}${suit}.png`,
      });
    }
  }

  if (includeJokers) {
    deck.push({
      value: 0,
      suit: 'JOKER',
      cardName: 'JOKER1',
      cardPath: '/assets/cards/JOKER1.png',
    });
    deck.push({
      value: 14,
      suit: 'JOKER',
      cardName: 'JOKER2',
      cardPath: '/assets/cards/JOKER2.png',
    });
  }

  return shuffle(deck);
}


export function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}


export function initEmptyStackGrid(): StackGrid {
  const grid: StackGrid = {};

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const position = `${row}-${col}`;
      grid[position] = { cards: [] };
    }
  }

  return grid;
}


export function dealInitialStacks(deck: Card[], stackGrid: StackGrid): { deck: Card[]; stackGrid: StackGrid } {
  const positions = Object.keys(stackGrid);
  const newDeck = [...deck];
  const newGrid: StackGrid = JSON.parse(JSON.stringify(stackGrid)); 

  for (const pos of positions) {
    const card = newDeck.pop();
    if (card) {
      newGrid[pos].cards.push(card);
    }
  }

  return { deck: newDeck, stackGrid: newGrid };
}
