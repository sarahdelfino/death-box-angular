import { Injectable } from '@angular/core';

import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { Game } from './game';
@Injectable({
  providedIn: 'root'
})
export class CrudService {
  gamesRef: AngularFireList<any>;
  gameRef: AngularFireObject<any>;
  

  constructor(private db: AngularFireDatabase) { }

  addGame(game: Game) {
    this.gamesRef.push({
      id: game.id,
      host: game.host,
      players: game.players
    });
  }

  getGame(id: string) {
    this.gameRef = this.db.object('games-list/' + id);
    return this.gameRef;
  }

  getGamesList() {
    this.gamesRef = this.db.list('games-list');
    return this.gamesRef;
  }

  updateGame(game: Game) {
    this.gameRef.update({
      id: game.id,
      host: game.host,
      players: game.players
    });
  }

  deleteGame(id: string) {
    this.gameRef = this.db.object('games-list/'+id);
    this.gameRef.remove();
  }

}