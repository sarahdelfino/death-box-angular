import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { Player } from '../player';


@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent implements OnInit {
  players;

  constructor(public gameService: GameService) { }

  ngOnInit() {
    this.getPlayers();
  }

  getPlayers() {
    this.players = this.gameService.players;
    console.log(this.players);
  }

  

}
