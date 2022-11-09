import { Injectable } from '@angular/core';
// import { AngularFireDatabase, AngularFireDatabaseModule, AngularFireList, AngularFireObject } from '@angular/fire/database';
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
    // this.gamesRef = firebase.database().ref('games');
    // this.playersRef = firebase.database().ref('players');
  }

  createGame(id: string, name: string) {
    this.db.database.ref('games/' + id).set({
      // currentPlayer: name,
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
    // firebase.database().ref('/games/' + id + '/currentPlayer/').set(name);
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
    .ref('games' + id)
    .update({
      seconds: increment(-1)});
  }

  incrementSeconds(id: string, player: string, seconds: number) {
    this.db.database
    .ref('/games/' + id + '/' + player + '/')
    .update({
      secondsDrank: increment(1)});
  }

  // getPlayers(id: string) {
  //   this.playersObj = this.db.object('players/' + id);
  //   return this.playersObj;
  // }

  // updatePlayers(id: string, players: any) {
  //   // firebase.database().ref('/players/' + id + '/').set(players);
  //   this.db.database.ref('/players/' + id + '/').set(players);
  // }

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

  // setCurrentPlayer(id: string, name: string) {
  //   // firebase.database().ref('/games/' + id + '/currentPlayer/').set(name);
  //   this.db.database.ref('/games/' + id + '/currentPlayer/').set(name);
  // }

  setCounter(id: string, name: string) {
    // firebase.database().ref('/games/' + id + '/counter').set(name);
    this.db.database.ref('/games/' + id + '/counter').update(name);
  }

  //  create(game: Game): any {
  //   // firebase.database().ref('/games/' + game.id).set({
  //   //   started: false
  //   // });
  //   this.db.database.ref('/games/' + game.id).set({
  //       started: false
  //     });
  //  }

  //  addPlayer(id: string, name: string, currentPlayer?: boolean) {
  //   if (typeof currentPlayer !== 'undefined') {
  //     // firebase.database().ref('/players/' + id + '/' + name + '/').set({
  //     //   "name": name,
  //     //   "secondsDrank": 0,
  //     //   "currentPlayer": true});
  //     this.db.database.ref('/players/' + id + '/' + name + '/').set({
  //         "name": name,
  //         "secondsDrank": 0,
  //         "currentPlayer": true});
  //     } else {
  //       this.db.database.ref('/players/' + id + '/' + name + '/').set({
  //             "name": name,
  //             "secondsDrank": 0});
  //     }
  //   // } else {
  //   //   firebase.database().ref('/players/' + id + '/' + name + '/').set({
  //   //     "name": name,
  //   //     "secondsDrank": 0});
  //   }

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
