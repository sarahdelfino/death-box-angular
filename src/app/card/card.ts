export class Card {
    value: string;
    suit: string;
    state?: string;
    private imgPath: string = "/assets/cards/";
    public cardPath: string;
    public cardName: string;

    constructor(value: string, suit: string, state?: string) {
        this.value = value;
        this.suit = suit;
        this.state = state;
        this.cardPath = this.imgPath + this.value + this.suit + ".png";
        this.cardName = this.value + this.suit;
    }

    public getCardDetails() {
        return this.value + this.suit;
    }

}