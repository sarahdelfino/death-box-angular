import { Injectable } from '@angular/core';
import { Card } from './card/card';
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
  constructor(
  ) {
    // this.createDeck();
   }

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

  // public createStacks(): Table {
  //   var tmp = new Array;
  //   for (let i = 0; i < 9; i++) {
  //     var stack = new Stack;
  //     stack.id = i;
  //     var tmpArr = Array();
  //     tmpArr.push(this.drawCard());
  //     stack.cards = tmpArr;
  //     tmp.push(stack);
  //   }
  //   console.log(tmp);
  //   this.table.stacks = tmp;
  //   console.log(this.table);
  //   console.log(this.table.stacks[0].cards[0].cardName);
  //   return this.table;
  // }

  public stackAdd(card: Card) {
    // this.stacks[0].push(card);
    // this.table.stacks[0].cards.splice(0, 0, card);
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
    console.log("User clicked: " + card);
    // this.stackAdd(card);
  }
}
