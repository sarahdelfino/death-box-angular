export class Game {
    id: string;
    host?: string;
    started?: boolean;
    currentPlayer?: string;
    seconds?: number;

    constructor(
        id: string,
        host?: string,
        started?: boolean,
        currentPlayer?: string,
        seconds?: number) {
        this.id = id;
        this.host = host;
        this.started = started;
        this.currentPlayer = currentPlayer;
        this.seconds = seconds;
    }

    public getGameId() {
        return this.id;
    }

    public getHost() {
        return this.host;
    }

}