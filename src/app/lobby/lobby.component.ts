import { Component, OnInit } from '@angular/core';
import { SocketioService } from '../socketio.service';
import { Location } from '@angular/common';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { Game } from '../game';
import { DatabaseService } from '../database.service';

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
    private location: Location,
    private db: DatabaseService
    ) { }

  ngOnInit() {
    this.getId();
    this.getHost();
    this.getPlayers();
  }

  getId(): void {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  getHost(): void {
    // this.db.getGame(this.id).subscribe(game => this.game = game);
    this.db.getGame(this.id).valueChanges().subscribe(data => {
      // console.log(data);
      this.host = data.host;
    });
    // console.log(this.game);
  }

  getPlayers() {
    this.db.getPlayers(this.id).valueChanges().subscribe(data => {
      console.log(data);
      for (let x in data) {
        this.playerList.push(data[x].name)
        // console.log(this.playerList);
      }
    })

  }

  startGame() {
    console.log("start");
    this.router.navigateByUrl(`/play/${this.id}`);
  }

}
