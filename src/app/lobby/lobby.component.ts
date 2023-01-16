import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { Game } from '../game';
import { DatabaseService } from '../database.service';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { GameService } from '../game.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit, OnDestroy {
  id: string;
  host: string;
  playerList = [];
  game: Game | undefined;
  started: boolean;
  isHost: boolean;
  test: any;
  subscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private db: DatabaseService,
    private _gameService: GameService,
    protected $gaService: GoogleAnalyticsService
  ) {
    if (sessionStorage.getItem('host') == 'true') {
      this.isHost = true;
    } else {
      this.isHost = false;
    }
    this.getId();
    this.subscription = this.db.getGame(this.id).valueChanges().subscribe(data => {
      this.started = data.started
    if (this.started == true) {
      this.router.navigateByUrl(`/play/${this.id}`);
    }
  });
  }

  ngOnInit() {
    this.$gaService.pageView('/lobby', 'lobby');
    this.getPlayers();
    // this._gameService.getPlayers().subscribe((players) => {
    //   console.log(players);
    // })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getId(): void {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  getPlayers() {
    this.db.getPlayers(this.id).valueChanges().subscribe(data => {
      console.log(data);
      this.playerList = Object.keys(data);
    });
  }

  startGame() {
    this.db.setStart(this.id).then(() => {
      console.log("successfully started game in db!");
    });
  }

}
