export class Card {
    value: string;
    suit: string;
    public cardPath: string;
    public cardName: string;

    constructor(value: string, suit: string) {
        this.value = value;
        this.suit = suit;
        this.cardPath = `/assets/cards/${value}${suit}.png`;
        this.cardName = this.value + this.suit;
    }
}
