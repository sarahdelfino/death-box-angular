export class Player {
    name: string;
    secondsDrank?: string;
    currentPlayer?: boolean;
    correctGuesses?: number;

    constructor(
        name: string,
        secondsDrank?: string,
        currentPlayer?: boolean,
        correctGuesses?: number) {
        this.name = name;
        this.secondsDrank = secondsDrank;
        this.currentPlayer = currentPlayer;
        this.correctGuesses = correctGuesses;
    }

}