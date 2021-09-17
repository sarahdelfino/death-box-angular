import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as io from 'socket.io-client';
import { environment } from '../environments/environment';
import { Game } from './game';
import { nanoid } from "nanoid";
import { Player } from './player';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  Game;
  socket = io(environment.SOCKET_ENDPOINT);
  players = this.socketio.fromEvent<string[]>('players');
  constructor(private router: Router,
    private socketio: Socket) { }

  public message$: BehaviorSubject<string> = new BehaviorSubject('');
  public player$: BehaviorSubject<string> = new BehaviorSubject('');

  setupSocketConnection(game) {
    // var id = nanoid(5);
    this.Game = new Game(game.id, game.host, [game.host]);
    console.log("GME: ", this.Game);
    console.log("GAAAAAAME: ", game);
    this.socket.emit('game created', game);
  }

  getGameId() {
    return this.Game.getGameId();
  }

  getHost() {
    return this.Game.getHost();
  }

  getGame(id: string): Observable<any> {
    // this.socketio.emit('get game', id);
    // const game = GAMES.find(g => g.id === id)!;
    console.log(`fetched game id=${id}`);
    return of(id);
  }

  getPlayers() {
    console.log(this.Game.getPlayers());
    return this.Game.players;
  }

  public sendMessage(message) {
    console.log(message);
    this.socket.emit('message', message);
  }

  public getNewMessage = () => {
    this.socket.on('message', (message) => {
      this.message$.next(message);
    });
    return this.message$.asObservable();
  }

  // public getGame = (game) => {
  //   this.socket.emit('get game', game);
  // }

  public getNewPlayer = () => {
    this.socket.on('join game', (player) => {
      this.player$.next(player);
    });
    return this.player$.asObservable();
  }

  joinGame(gameData) {
    this.socket.emit('join game', gameData);
  }

  disconnect() {
    if (this.socket) {
      console.log("disconnecting...");
      this.socket.disconnect();
    }
  }

}
