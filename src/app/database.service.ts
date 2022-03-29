import { Injectable } from '@angular/core';
import { FirebaseApp } from '@angular/fire';
import { AngularFireDatabase, AngularFireDatabaseModule, AngularFireList, AngularFireObject } from '@angular/fire/database';
import firebase from "firebase/app";
import "firebase/database";
import { Observable } from 'rxjs';
import { Card } from './card/card';
import { Game } from './game';
import { Player } from './player';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private dbPath = '/games';
  gameObj: AngularFireObject<Game> = null;
  playersObj: AngularFireObject<Player> = null;
  deckList: AngularFireList<Card> = null;
  playersObject: AngularFireObject<Player> = null;
  host = null;
  database = null;
  gamesRef = null;
  playersRef = null;
  secondsRef = null;


  constructor(private db: AngularFireDatabase) {
    this.database = firebase.database();
    this.gamesRef = firebase.database().ref('games');
    this.playersRef = firebase.database().ref('players');
   }

  // Fetch Single Game Object
  getGame(id: string) {
    this.gameObj = this.db.object('games/' + id);
    return this.gameObj;
  }

  setStart(id: string) {
    firebase.database().ref('games/' + id).update({
      started: true
    });
  }

  getSeconds(id: string) {
    console.log(id);
    this.secondsRef = this.db.object('games/' + id + '/seconds/');
    return this.secondsRef;
  }

  decrementSeconds(id: string) {
    firebase.database()
    .ref('games')
    .child(id)
    .child('seconds')
    .set(firebase.database.ServerValue.increment(-1))
  }

  updateCount(id: string, count: number) {
    firebase.database().ref('games/' + id + '/count/').update(count);
  }

  getPlayers(id: string) {
    this.playersObj = this.db.object('players/' + id);
    return this.playersObj;
  }

  updatePlayers(id: string, players: any) {
    firebase.database().ref('/players/' + id + '/').set(players);
  }

  updateSeconds(id: string, player: string, seconds: number) {
    firebase.database().ref('/players/' + id + '/' + player + '/secondsDrank/').set(seconds);
  }

  updateGameSeconds(id: string, seconds: number) {
    firebase.database().ref('/games/' + id + '/seconds/').set(seconds);
  }

  updateCounting(id: string) {
    firebase.database().ref('/games/' + id + '/counting/').set(true);
  }

  deleteCounting(id: string) {
    firebase.database().ref('/games/' + id + '/counting/').remove();
  }

  getCurrentPlayer(id: string) {
    this.gameObj = this.db.object('games/' + id + '/currentPlayer/');
    return this.gameObj;
  }

  setCurrentPlayer(id: string, name: string) {
    firebase.database().ref('/players/' + id + '/currentPlayer/').set(name);
  }

   create(game: Game): any {
    firebase.database().ref('/games/' + game.id).set({
      started: false
    });
   }

   addPlayer(id: string, name: string, currentPlayer?: boolean) {
    if (typeof currentPlayer !== 'undefined') {
      firebase.database().ref('/players/' + id + '/' + name + '/').set({
        "name": name,
        "secondsDrank": 0,
        "currentPlayer": true});
    } else {
      firebase.database().ref('/players/' + id + '/' + name + '/').set({
        "name": name,
        "secondsDrank": 0});
    }
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
