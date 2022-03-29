export class Game {
    id: string;
    started?: boolean;
    currentPlayer?: string;
    seconds?: number;
    counting?: boolean;

    constructor(
        id: string,
        started?: boolean,
        currentPlayer?: string,
        seconds?: number,
        counting?: boolean) {
        this.id = id;
        this.started = started;
        this.currentPlayer = currentPlayer;
        this.seconds = seconds;
        this.counting = counting;
    }

    public getGameId() {
        return this.id;
    }

}