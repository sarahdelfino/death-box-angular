export class Player {
    name: string;
    secondsDrank: string;
    currentPlayer: boolean;

    constructor(
        name: string,
        secondsDrank: string,
        currentPlayer: boolean) {
        this.name = name;
        this.secondsDrank = secondsDrank;
        this.currentPlayer = currentPlayer;
    }

}