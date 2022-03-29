import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Game } from '../game';
import { DatabaseService } from '../database.service';
import { GameService } from '../game.service';
import { Player } from '../player';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit, OnDestroy {
  id: string;
  host: string;
  playerList: Player[] = [];
  game: Game | undefined;
  started: boolean;
  isHost: boolean;
  test: any;
  subscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private gameService: GameService,
    private db: DatabaseService
  ) {
    if (localStorage.getItem('host') == 'true') {
      this.isHost = true;
    } else {
      this.isHost = false;
    }
    this.getId();
    this.subscription = this.db.getGame(this.id).valueChanges().subscribe(data => {
      // console.log(data);
        this.started = data.started
      // if (localStorage.getItem('user') == this.host) {
      //   this.isHost = true;
      // } else {
      //   this.isHost = false;
      // }
      if (this.started == true) {
        this.router.navigateByUrl(`/play/${this.id}`);
      }
    })
    this.getPlayers();
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getId(): void {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  getPlayers() {
    this.db.getPlayers(this.id).valueChanges().subscribe(data => {
      // console.log(data);
      // console.log(JSON.stringify(data));
      for (let p in data) {
          this.playerList.push(data[p]);
      }
      this.playerList = this.playerList.filter((v,i,a)=>a.findIndex(t=>(t.name===v.name))===i);
      console.log(this.playerList);
      if (this.playerList[0] && !this.playerList[0].currentPlayer) {
        this.playerList[0].currentPlayer = true;
        this.db.updatePlayers(this.id, this.playerList);
      }
      console.log(this.playerList);
    });
  }

  startGame() {
    this.db.setStart(this.id);
    // this.router.navigateByUrl(`/play/${this.id}`);
  }

}
