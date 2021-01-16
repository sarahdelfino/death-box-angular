import { Component, OnInit } from '@angular/core';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { GameService } from '../game.service';
import { Player } from '../player';


@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent implements OnInit {
  players:any = [];

  constructor(public gameService: GameService) { }

  ngOnInit() {
    this.players = this.gameService.getPlayers();
    console.log("PLAYERS COMPONENT: ", this.players);
  }

  

}
