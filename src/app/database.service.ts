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
  gamesList: AngularFireList<Game> = null;
  gameRef: AngularFireObject<any> = null;
  playersList: AngularFireList<Player> = null;
  deckList: AngularFireList<Card> = null;
  playersObject: AngularFireObject<Player> = null;
  host = null;
  database = null;
  gamesRef = null;
  playersRef = null;
  secondsRef = null;


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

  setStart(id: string) {
    firebase.database().ref('games/' + id).update({
      started: true
    });
  }

  getPlayers(id: string) {
    // this.playersList = this.db.list('players/' + id);
    this.playersList = this.db.list('players/' + id);
    return this.playersList;
  }

  updateSeconds(id: string, players: any) {
    firebase.database().ref('/players/' + id + '/').set(players);
  }

  getCurrentPlayer(id: string) {
    this.gameRef = this.db.object('games/' + id + '/currentPlayer/');
    return this.gameRef;
  }

  setCurrentPlayer(id: string, name: string) {
    firebase.database().ref('/games/' + id + '/currentPlayer/').set(name);
  }

   create(game: Game, deck, stacks): any {
    firebase.database().ref('/games/' + game.id).set({
      host: game.host,
      currentPlayer: game.host,
      deck: deck,
      stacks: stacks,
      started: false
    });
    this.addPlayer(game.id, game.host);
   }

   getDeck(id: string) {
    this.deckList = this.db.list('/games/' + id + '/deck/');
    return this.deckList;
   }

   updateDeck(id: string, deck: any) {
     console.log(deck);
     firebase.database().ref('/games/' + id + '/deck/').set(deck);
   }

   updateStacks(id: string, stacks: any) {
     firebase.database().ref('/games/' + id + '/stacks/').update(stacks);
   }

   getStack(id: string, stack: any) {
     return firebase.database().ref('/games/' + id + '/stacks/' + stack + '/');
   }

  //  addPlayer(id: string, players: any) {
  //    firebase.database().ref('/players/' + id + '/').set(players);
  //  }

   update(id: string, val: any): Promise<void> {
     let playerCount = 0;
     playerCount += 1;
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

   deleteGame(id: string): Promise<void> {
     this.deletePlayers(id);
     return this.gamesList.remove(id);
   }

   deletePlayers(id: string): Promise<void> {
     return this.playersRef.remove(id);
   }

   deleteAll(): Promise<void> {
     return this.gamesList.remove();
   }

}
