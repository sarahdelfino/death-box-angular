import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as io from 'socket.io-client';
import { environment } from './environment';
import { Game } from './game';
import { nanoid } from "nanoid";
import { Player } from './player';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  Game;
  socket = io(environment.SOCKET_ENDPOINT);
  constructor(private router: Router) { }

  setupSocketConnection(host) {
    // this.socket = io('http://127.0.0.1:3000');
    console.log(host);
    var id = nanoid(5);
    this.Game = new Game(id, host, host);
    // this.Game.id = id;
    // this.Game.host = host;
    // this.Game.players = [];
    // this.Game.players.push(new Player(host, '0'));
    console.log("GME: ", this.Game);
    // this.Game = new Game();
    console.log("GAAAAAAME: ", this.Game);
    this.socket.emit('game created', this.Game);
    // this.socket.on('game', (data) => {
    // this.Game._id = data._id;
    // this.Game.host = data.host;
    // this.Game.players = data.players;
    // console.log(this.Game);
    // this.router.navigateByUrl('/lobby');
    // });
  }

  getGameId() {
    return this.Game.getGameId();
  }

  getHost() {
    return this.Game.getHost();
  }

  getPlayers() {
    console.log(this.Game.getPlayers());
    return this.Game.players;
  }

  joinGame(gameData) {
    console.log(gameData);
    console.log(this.Game);
    this.socket.emit('join game', gameData);
  }

  disconnect() {
    if (this.socket) {
      console.log("disconnecting...");
      this.socket.disconnect();
    }
  }

}
