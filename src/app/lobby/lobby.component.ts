import { Component, OnInit } from '@angular/core';
import { SocketioService } from '../socketio.service';
import { Location } from '@angular/common';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { Game } from '../game';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  id: string;
  host: string;
  playerList: string[] = [];
  players: Observable<string[]>;
  game: Game | undefined;

  constructor(private socketService: SocketioService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location) { }

  ngOnInit() {
    this.getId();
    console.log(this.game);
    // this.id = this.socketService.getGameId();
    this.host = this.socketService.getHost();
    this.players = this.socketService.players;
    // this.playerList.push(this.host);
    // this.players = this.socketService.getPlayers();
    this.socketService.getNewPlayer().subscribe((player: string) => {
      this.playerList.push(player);
    })
    this.socketService.getGame(this.id);
  }

  getId(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.socketService.getGame(id).subscribe(id => this.id = id);
  }

  startGame() {
    console.log("start");
    this.router.navigateByUrl(`/play/${this.id}`);
  }

}
