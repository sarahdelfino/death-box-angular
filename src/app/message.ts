export class Message {
    id: string;
    message?: string;
    player?: string;

    constructor(
        id: string,
        message?: string,
        player?: string) {
            this.id = id;
            this.message = message;
            this.player = player;
        }
}