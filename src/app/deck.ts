import { Card } from './card/card';

export class Deck {

    values = [1,2,3,4,5,6,7,8,9,10,11,12,13,14]
    suits = ['Diamonds', 'Clubs', 'Hearts', 'Spades']
    deck = []

    build() {
        this.suits.forEach((s) => {
            for (const v of this.values) {
                this.deck.push(new Card(v.toString(), s))
            }
        })
        return this.deck
    }
}