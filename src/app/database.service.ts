import { Injectable } from '@angular/core';
import { FirebaseApp } from '@angular/fire';
import { AngularFireDatabase, AngularFireDatabaseModule, AngularFireList, AngularFireObject } from '@angular/fire/database';
import firebase from "firebase/app";
import "firebase/database";
import { Observable } from 'rxjs';
import { Game } from './game';
import { Player } from './player';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private dbPath = '/games';
  gamesList: AngularFireList<Game> = null;
  gameRef: AngularFireObject<Game> = null;
  playersList: AngularFireList<any> = null;
  host = null;
  database = null;
  gamesRef = null;
  playersRef = null;


  constructor(private db: AngularFireDatabase) {
    this.gamesList = db.list('/games/');
    this.database = firebase.database();
    this.gamesRef = firebase.database().ref('games');
    this.playersRef = firebase.database().ref('players');
   }

  // Fetch Single Game Object
  getGame(id: string) {
    this.gameRef = this.db.object('games/' + id);
    return this.gameRef;
  }

  getPlayers(id: string) {
    this.playersList = this.db.list('players/' + id);
    return this.playersList;
  }

   create(game: Game): any {
    firebase.database().ref('/games/' + game.id).set({
      host: game.host
    });
    this.addPlayer(game.id, game.host);
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

  addPlayer(id, name) {
    // A post entry.
    var postData = {
      name: name,
      seconds: 0
    };
  
    // Get a key for a new Post.
    var newPostKey = firebase.database().ref('players').child(id).push().key;
  
    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};
    updates['/players/' + id + '/' + newPostKey + '/'] = postData;
  
    return firebase.database().ref().update(updates);
  }

   delete(id: string): Promise<void> {
     return this.gamesList.remove(id);
   }

   deleteAll(): Promise<void> {
     return this.gamesList.remove();
   }

}
