import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/compat/database';
import "firebase/database";
import { increment } from 'firebase/database';
import { Observable } from 'rxjs';
import { Card } from './card/card';
import { Game } from './game';
import { Player } from './player';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private dbPath = '/games';
  gameObj: AngularFireObject<any> = null;
  playersObj: AngularFireObject<Player> = null;
  deckList: AngularFireList<Card> = null;
  playersObject: AngularFireObject<Player> = null;
  playersList: AngularFireList<Player> = null;
  host = null;
  database = null;
  gamesRef = null;
  playersRef = null;
  secondsRef = null;


  constructor(private db: AngularFireDatabase) {
  }

  createGame(id: string, name: string) {
    this.db.database.ref('games/' + id).set({
      started: false,
      players: {
        [name]: {
          secondsDrank: 0,
          currentPlayer: true
        }
      }
    });
  }

  addPlayer(id: string, name: string) {
    this.db.database.ref('/games/' + id + '/players/').update({
      [name]: {
        secondsDrank: 0
      }
    });
  }

  getPlayers(id: string) {
    this.playersObj = this.db.object('games/' + id + '/players/');
    return this.playersObj;
  }

  // Fetch Single Game Object
  getGame(id: string) {
    this.gameObj = this.db.object('games/' + id);
    return this.gameObj;
  }

  setStart(id: string) {
    this.db.database.ref('games/' + id).update({
      started: true
    });
  }

  setCurrentPlayer(id: string, name: string) {
    this.db.database.ref('/games/' + id + '/currentPlayer/').update(name);
  }

  updatePlayers(id: string, players: any) {
    this.db.database.ref('/games/' + id + '/players/').update(players);
  }

  getSeconds(id: string) {
    this.secondsRef = this.db.object('games/' + id + '/seconds/');
    return this.secondsRef;
  }

  decrementSeconds(id: string) {
    this.db.database
    .ref('/games/' + id)
    .update({
      seconds: increment(-1)});
  }

  incrementSeconds(id: string, player: string, seconds: number) {
    this.db.database
    .ref('/games/' + id + '/' + player + '/')
    .update({
      secondsDrank: increment(1)});
  }

  updatePlayerSeconds(id: string, player: string, seconds: number) {
    this.db.database.ref('/players/' + id + '/' + player + '/secondsDrank/').update(seconds);
  }

  updateGameSeconds(id: string, seconds: number) {
    this.db.database.ref('/games/' + id).update({
      seconds: seconds});
  }

  updateCounting(id: string) {
    this.db.database.ref('/games/' + id).update({
      counting: true
    });
  }

  endCounting(id: string) {
    this.db.database.ref('/games/' + id + '/').update({
      "counting": null,
      "seconds": null,
      "counter": null,
    });
  }

  deleteCounting(id: string) {
    this.db.database.ref('/games/' + id + '/counting/').remove();
  }

  deleteSeconds(id: string) {
    this.db.database.ref('/games/' + id + '/seconds/').remove();
  }

  getCurrentPlayer(id: string) {
    this.gameObj = this.db.object('games/' + id + '/currentPlayer/');
    return this.gameObj;
  }

  setCounter(id: string, name: string) {
    this.db.database.ref('/games/' + id + '/').update({
      counter: name});
  }

  deleteGame(id: string): Promise<void> {
    this.deletePlayers(id);
    return this.gameObj.remove();
  }

  deletePlayers(id: string): Promise<void> {
    return this.playersRef.remove(id);
  }

  deleteAll(): Promise<void> {
    return this.gameObj.remove();
  }

}
