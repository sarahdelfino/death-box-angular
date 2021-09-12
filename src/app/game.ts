import { Player } from "./player";

export class Game {
    id: string;
    host: string;
    players: Array<{name: string, secondsDrank: string}>;

    constructor(
        id: string,
        host: string,
        players: []) {
        this.id = id;
        this.host = host;
        this.players = players;
    }
    public getGameId() {
        return this.id;
    }

    public getHost() {
        return this.host;
    }

    public getPlayers() {
        let tmp = [];
        console.log(this.players);
        for (let p in this.players) {
            tmp.push(this.players[p]);
        }
        return this.players;
    }

    public addPlayer(player: string) {
        console.log(player);
        this.players.push({ name: player, secondsDrank:'0' });
    }
}