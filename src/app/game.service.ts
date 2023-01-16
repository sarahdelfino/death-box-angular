import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Card } from './card/card';
import { Player } from './player';
import { DatabaseService } from './database.service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  deck = new Array<Card>();
  players = new Array<Player>();
  currentPlayer = 1;
  rootURL = '/api';
  public stacks: any = [];
  newCard: Card;
  public turns = 0;
  private _players = new ReplaySubject()
  private _players$ = this._players.asObservable();

  constructor(private http: HttpClient,
    private route: ActivatedRoute,
    private db: DatabaseService) { }

  public createDeck(): Array<Card> {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    const suits = ['D', 'C', 'H', 'S']
    suits.forEach((s) => {
      for (const v of values) {
        this.deck.push(new Card(v.toString(), s));
      }
    });
    this.shuffle(this.deck);
    return this.deck;
  }

  public getDeckLength() {
    return this.deck.length;
  }

  public shuffle(deck: Array<Card>) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = deck[i];
      deck[i] = deck[j];
      deck[j] = temp;
    }
    return deck;
  }

  public getId() {
    const id = this.route.snapshot.paramMap.get('id');
    return id;
  }

  createStacks(deck: Array<Card>) {
    for (let i = 0; i < 9; i++) {
      const stack = [];
      stack.push(deck.pop());
      this.stacks.push(stack);
    }
    return this.stacks;
  }

  public drawCard() {
    return this.deck.pop();
  }

  compare(choice: string, card, newCard) {
    console.log(choice, card, newCard);
  if ((choice == "higher" && (Number(newCard) > Number(card))) || (choice == "lower" && (Number(newCard) < Number(card)))) {
    return true;
  } else {
    return false;
  }
}

// createPlayers(name: string) {
//   const players = new BehaviorSubject({
//       [name]: {
//         secondsDrank: 0
//       }
//       });
//   console.log(players);
// }

getPlayers(): Observable<any> {
  return this._players$;
  }

setPlayers(players: any) {
  this._players.next(players);
}



getNextPlayer(playerIndex: number, playerList: any) {
  let newIndex = 0;

  delete playerList[playerIndex].currentPlayer;

  if (playerIndex == playerList.length - 1) {
    playerList[newIndex].currentPlayer = true;
  } else {
    newIndex = playerIndex + 1;
    playerList[newIndex].currentPlayer = true;
  }
  this.db.updatePlayers(this.getId(), playerList).then(() => {
    console.log("Updated players successfully!");
  });
}

}
