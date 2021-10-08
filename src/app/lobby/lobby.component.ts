import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { Game } from '../game';
import { DatabaseService } from '../database.service';
import { GameService } from '../game.service';
import { Player } from '../player';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  id: string;
  host: string;
  playerList: Player[] = [];
  players: Observable<string[]>;
  game: Game | undefined;
  started: boolean;
  isHost: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private gameService: GameService,
    private db: DatabaseService
    ) { }

  ngOnInit() {
    if (localStorage.getItem('host') == 'true') {
      this.isHost = true;
    } else {
      this.isHost = false;
    }
    this.getId();
    // this.id = this.gameService.getId();
    // this.getHost();
    this.db.getGame(this.id).valueChanges().subscribe(data => {
      // console.log(data);
      this.host = data.host,
      this.started = data.started
      if (this.started == true) {
        this.router.navigateByUrl(`/play/${this.id}`);
      }
    })
    this.getPlayers();
  }

  getId(): void {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  getHost(): void {
    this.db.getGame(this.id).valueChanges().subscribe(data => {
      this.host = data.host;
    });
  }

  getPlayers() {
    this.db.getPlayers(this.id).valueChanges().subscribe(data => {
      this.playerList = data;
    })

  }

  startGame() {
    this.db.setStart(this.id);
    // this.router.navigateByUrl(`/play/${this.id}`);
  }

}
