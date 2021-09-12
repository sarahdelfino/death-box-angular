import { Component, OnInit } from '@angular/core';
import { SocketioService } from '../socketio.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  id: string;
  host: string;
  players: [];

  constructor(private socketService: SocketioService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.id = this.socketService.getGameId();
    this.host = this.socketService.getHost();
    this.players = this.socketService.getPlayers();
  }

}
