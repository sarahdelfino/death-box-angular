import { LEADING_TRIVIA_CHARS } from '@angular/compiler/src/render3/view/template';
import { Component, OnInit } from '@angular/core';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { GameService } from '../game.service';
import { Player } from '../player';
import { SocketService } from '../socket.service';


@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent implements OnInit {
  newMessage: string;
  messageList: string[] = [];
  players: any = [];
  users: any[] = [];
  player = this.players.name;
  secondsDrank = this.players.secondsDrank;
  tmp = 0;
  currentPlayer = 0;


  constructor(public gameService: GameService) { }


  ngOnInit() {
    this.players = this.gameService.getPlayers();
    // this.currentPlayer = this.players[this.tmp].name;
    this.setCurrentPlayer();
    console.log(this.currentPlayer);
    console.log(this.gameService.getCurrentPlayer());
  }

  public setCurrentPlayer(): void {
    console.log("PLAYERS COMPONENT: ", this.players);
    this.currentPlayer = this.currentPlayer + 1;
    console.log("CURRENT PLAYER: ", this.currentPlayer);
    if (this.currentPlayer == this.players.length-1) {
      this.currentPlayer = 0;
    }
  }

  // public setCurrentPlayer(x: number): void {
  //   this.currentPlayer = this.players[x].name;
  // }


}
