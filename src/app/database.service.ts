import { Injectable } from '@angular/core';
import { FirebaseApp } from '@angular/fire';
import { AngularFireDatabase, AngularFireDatabaseModule, AngularFireList, AngularFireObject } from '@angular/fire/database';
import firebase from "firebase/app";
import "firebase/database";
import { Game } from './game';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private dbPath = '/games/';
  gamesList: AngularFireList<Game> = null;
  dbRef: AngularFireObject<Game> = null;
  database = null;
  gamesRef = null;
  playersRef = null;


  constructor(private db: AngularFireDatabase) {
    this.gamesList = db.list(this.dbPath);
    // this.dbRef = db.object(this.dbPath);
    this.database = firebase.database();
    this.gamesRef = firebase.database().ref('games');
    this.playersRef = firebase.database().ref('players');
   }

   getAll(): AngularFireList<Game> {
     return this.gamesList;
   }

   create(game: Game): any {
  // return this.gamesRef.push(game);
    // return this.gamesList.update(game.id, {
    //   host: game.host
    // });
    // this.gamesList.update(game.id, {
    //   host: game.host,
    // })
    firebase.database().ref('/games/' + game.id).set({
      host: game.host
    });
    this.update(game.id, game.host);
   }

   update(id: string, val: any): Promise<void> {
     let playerCount = 0;
     console.log("BEF: " + playerCount);
     playerCount += 1;
     console.log("AFT: " + playerCount);
     var p = "player";
     p = "player" + playerCount.toString();
     return firebase.database().ref('/players/' + id + '/' + p + '/').set({
      "name": val,
      "secondsDrank": 0});
   }

  //  addPlayer(id: string, name: string): Promise<void> {
  //    let path = '/games/' + id + '/players/';
  //    let tmp = this.db.list(path);
  //   //  return tmp.update(name: "true");
  //  }

   delete(id: string): Promise<void> {
     return this.gamesList.remove(id);
   }

   deleteAll(): Promise<void> {
     return this.gamesList.remove();
   }

}
