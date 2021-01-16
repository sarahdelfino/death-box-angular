import { Injectable } from '@angular/core';
import { Card } from './card/card';
import { Player } from './player';
import { Stack } from './stack';
import { Table } from './table';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
  suits = ['D', 'C', 'H', 'S']
  deck = new Array<Card>();
  table = new Table;
  players = new Array<Player>();
  constructor() { }

  public createDeck(): Array<Card> {
    this.suits.forEach((s) => {
      for (let v of this.values) {
        this.deck.push(new Card(v.toString(), s));
      }
    });
    this.shuffle(this.deck);
    return this.deck;
  }

  public getDeckLength() {
    return this.deck.length;
  }

  public shuffle(deck) {
    for (var i = deck.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = deck[i];
      deck[i] = deck[j];
      deck[j] = temp;
    }
  }

  public stackIndex() {
    return this.table.stacks;
  }

  public getStackLength() {
    return this.table.stacks.length;
  }

  public drawCard() {
    return this.deck.pop();
  }

  public clickedCard(card: Card) {
    // console.log("User clicked: " + card);
  }

  public addPlayers(players) {
    console.log("PLAYERS: ", players);
    for(let p in players) {
      this.players.push(new Player(players[p], ""));
    }
    console.log(this.players);
    localStorage.setItem('players', JSON.stringify(this.players));
    // sessionStorage.setItem('players', JSON.stringify(players));
    // return this.players;
    // console.log("IN GAME SERVICE:", players);
  }

  public getPlayers(): Array<Player> {
    console.log("INSIDE GET PLAYERS: ", this.players);
    console.log("LOCALSTORAGE: ", localStorage.getItem('players'));
    this.players = JSON.parse(localStorage.getItem('players'));
    return this.players;
  }
}
