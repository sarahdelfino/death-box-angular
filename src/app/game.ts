import { Player } from "./player";

export class Game {
    id?: string | null;
    started?: boolean;
    counter?: string;
    currentPlayer?: string;
    seconds?: number;
    counting?: boolean;
    players?: Array<Player>

    constructor(
        id?: string,
        started?: boolean,
        currentPlayer?: string,
        seconds?: number,
        counting?: boolean,
        players?: Array<Player>) {
        this.id = id;
        this.started = started;
        this.currentPlayer = currentPlayer;
        this.seconds = seconds;
        this.counting = counting;
        this.players = players;
    }

    public getGameId() {
        return this.id;
    }

    public getPlayers() {
        return this.players;
    }

}