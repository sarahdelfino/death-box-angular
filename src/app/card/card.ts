import { Coord } from "src/coord";

export class Card {
    value: string;
    suit: string;
    state?: string;
    position?: Coord;
    private imgPath: string = "/assets/cards/";
    public cardPath: string;
    public cardName: string;

    constructor(value: string, suit: string, state?: string, position?: Coord) {
        this.value = value;
        this.suit = suit;
        this.state = state;
        this.position = position;
        this.cardPath = this.imgPath + this.value + this.suit + ".png";
        this.cardName = this.value + this.suit;
    }

    public getCardDetails() {
        return this.value + this.suit;
    }

}