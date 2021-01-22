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
  currentPlayer = "";

  constructor(public gameService: GameService) { }


  ngOnInit() {
    this.players = this.gameService.getPlayers();
    console.log("PLAYERS COMPONENT: ", this.players);
    this.currentPlayer = this.players[0].name;
    console.log("CURRENT PLAYER: ", this.currentPlayer);
  }

  // getAllPlayers() {
  //   this.gameService.getUsers().pipe().subscribe((users: any[]) => {
  //     this.users = users;
  //   });
  // }

  

}
