export class Card {
    value: string;
    suit: string;
    // private imgPath: string = "/assets/cards/";
    public cardPath: string;
    public cardName: string;

    constructor(value: string, suit: string) {
        this.value = value;
        this.suit = suit;
        // this.cardPath = this.imgPath + this.value + this.suit + ".png";
        this.cardPath = `/assets/cards/${value}${suit}.png`;
        this.cardName = this.value + this.suit;
    }

    // public getCardDetails() {
    //     return this.value + this.suit;
    // }

}
