export class Game {
    id: string;
    started?: boolean;
    currentPlayer?: string;
    seconds?: number;
    counting?: boolean;
    counter?: string;

    constructor(
        id: string,
        started?: boolean,
        currentPlayer?: string,
        seconds?: number,
        counting?: boolean,
        counter?: string) {
        this.id = id;
        this.started = started;
        this.currentPlayer = currentPlayer;
        this.seconds = seconds;
        this.counting = counting;
        this.counter = counter;
    }

    public getGameId() {
        return this.id;
    }

}