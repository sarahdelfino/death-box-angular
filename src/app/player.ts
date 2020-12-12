export class Player {
    name: string;
    secondsDrank: string;

    constructor(name: string, secondsDrank: string) {
        this.name = name;
        this.secondsDrank = secondsDrank;
    }

    public getPlayer() {
        return new Array(this.name, this.secondsDrank);
    }
}