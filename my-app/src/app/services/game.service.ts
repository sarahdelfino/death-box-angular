import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Game } from 'src/app/models/game.model';
import { nanoid } from 'nanoid';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  currentGame = this.socket.fromEvent<Game>('game');
  games = this.socket.fromEvent<string[]>('games');

  constructor(private socket: Socket) { }

  getGame(id: string) {
    this.socket.emit('getGame', id);
  }

  newGame() {
    this.socket.emit('newGame', { id: this.gameId(), game: '' });
  }

  private gameId() {
    let id = nanoid(5);
    return id;
  }
}
