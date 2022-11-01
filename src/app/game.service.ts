import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Card } from './card/card';
import { Player } from './player';
import { Stack } from './stack';
import { Table } from './table';
import { GameComponent } from './game/game.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ModalComponent } from './modal/modal.component';
import { DatabaseService } from './database.service';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
  suits = ['D', 'C', 'H', 'S']
  deck = new Array<Card>();
  table = new Table;
  players = new Array<Player>();
  currentPlayer = 1;
  rootURL = '/api';
  public stacks: any = [];
  newCard: Card;
  public turns = 0;

  constructor(private http: HttpClient,
    private route: ActivatedRoute,
    private db: DatabaseService,
    private dialog: MatDialog,) { }

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

  public getId() {
    const id = this.route.snapshot.paramMap.get('id');
    return id;
  }

  createStacks(deck) {
    for (let i = 0; i < 9; i++) {
      var stack = new Array();
      stack.push(deck.pop());
      this.stacks.push(stack);
    }
    return this.stacks;
  }
  
  public stackIndex() {
    return this.table.stacks;
  }

  public drawCard() {
    return this.deck.pop();
  }

  public clickedCard(card: Card) {
    // console.log("User clicked: " + card);
  }

  compare(choice: string, card, newCard) {
    console.log(choice, card, newCard);
  if ((choice == "higher" && (Number(newCard) > Number(card))) || (choice == "lower" && (Number(newCard) < Number(card)))) {
    return true;
  } else {
    return false;
  };
}

openModal(data: any) {
  const dialogConfig = new MatDialogConfig();
  const timeout = 1000;
  dialogConfig.data = data;

  const dialogRef = this.dialog.open(ModalComponent, dialogConfig);

  dialogRef.afterOpened().subscribe(_ => {
    setTimeout(() => {
      dialogRef.close();
    }, timeout)
  })
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
  this.db.updatePlayers(this.getId(), playerList);
}

}
