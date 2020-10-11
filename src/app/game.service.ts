import { Injectable } from '@angular/core';
import { Card } from './card/card';
import { Stack } from './stack';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
  suits = ['D', 'C', 'H', 'S']
  deck = new Array<Card>();
  stacks = new Array<Stack>();
  constructor() { }

  public createDeck() {
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

  public createStacks(): Array<Stack> {
    for (let i = 0; i < 9; i++) {
      var stack = new Array();
      // stack.push(this.drawCard());
      // stack = this.drawCard();
      stack.push(this.drawCard());
      // console.log("Stack[0]: ", stack[0]);
      // this.stacks.push(stack[0]);
      // console.log("Stacks[i]: ", this.stacks[i][0]);
      this.stacks['card'] = stack[0];
      console.log(this.stacks);
    }
    // this.stacks[0].push(this.drawCard());
    // console.log("Stacks[0] after: ", this.stacks[0]);
    console.log(this.stacks);
    return this.stacks;
  }

  public stackAdd(card: Card) {
    // this.stacks[0].push(card);
    this.stacks.splice(0, 0, card);
  }

  // public stackIndex() {
  //   return 
  // }

  public getStackLength() {
    return this.stacks.length;
  }

  public drawCard() {
    return this.deck.pop();
  }

  public clickedCard(card: Card) {
    console.log("User clicked: " + card.getCardDetails());
    this.stackAdd(card);
    console.log("Stacks: ", this.stacks)
  }
}
