export class Game {
    id: string;
    host?: string;
    started?: boolean;
    currentPlayer?: string;
    seconds?: number;
    counting?: boolean;

    constructor(
        id: string,
        host?: string,
        started?: boolean,
        currentPlayer?: string,
        seconds?: number,
        counting?: boolean) {
        this.id = id;
        this.host = host;
        this.started = started;
        this.currentPlayer = currentPlayer;
        this.seconds = seconds;
        this.counting = counting;
    }

    public getGameId() {
        return this.id;
    }

    public getHost() {
        return this.host;
    }

}