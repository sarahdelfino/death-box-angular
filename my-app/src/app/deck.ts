import { Card } from './card/card';

// export const DECK: Card[] = [
//     { value: 2, image: '../assets/2C.png'},
//     { value: 3, image: '../assets/3D.png'},
//     { value: 4, image: '../assets/4H.png'},
//     { value: 5, image: '../assets/5S.png'},
//     { value: 6, image: '../assets/6C.png'},
//     { value: 7, image: '../assets/7D.png'},
//     { value: 8, image: '../assets/8H.png'},
//     { value: 9, image: '../assets/9S.png'},
// ];
export class Deck {

    values = [1,2,3,4,5,6,7,8,9,10,11,12,13,14]
    suits = ['Diamonds', 'Clubs', 'Hearts', 'Spades']
    deck = []

    build() {
        this.suits.forEach((s) => {
            for (let v of this.values) {
                this.deck.push(new Card(v.toString(), s))
            }
        })
        return this.deck
    }
}