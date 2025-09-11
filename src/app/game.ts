import { Card } from "./card/card";
import { Player } from "./player";

export class Game {
    id?: string | null;
    started?: boolean;
    counter?: string;
    currentPlayer?: string;
    deck?: Array<string>;
    seconds?: number;
    counting?: boolean;
    players?: Array<Player>
    deck?: Array<Card>
    stacks?: Array<Card> 

    constructor(
        id?: string,
        started?: boolean,
        currentPlayer?: string,
        deck?: Array<string>,
        seconds?: number,
        counting?: boolean,
        players?: Array<Player>,
        deck? : Array<Card>,
        stacks? : Array<Card>) {
        this.id = id;
        this.started = started;
        this.currentPlayer = currentPlayer;
        this.deck = deck;
        this.seconds = seconds;
        this.counting = counting;
        this.players = players;
        this.deck = deck;
        this.stacks = stacks;
    }

    public getGameId() {
        return this.id;
    }

    public getPlayers() {
        return this.players;
    }

    public getDeck() {
        return this.deck;
    }

<<<<<<< HEAD
=======
    public getStacks() {
        return this.stacks;
    }

>>>>>>> 33761f206bcf5fba8467fd4789bdac2a45b380be
}