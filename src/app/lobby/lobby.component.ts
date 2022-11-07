import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Game } from '../game';
import { DatabaseService } from '../database.service';
import { GameService } from '../game.service';
import { GoogleAnalyticsService } from 'ngx-google-analytics';

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
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getId(): void {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  getPlayers() {
    this.db.getPlayers(this.id).valueChanges().subscribe(data => {
      for (let p in data) {
          this.playerList.push(data[p].name);
      }
      this.playerList = this.playerList.filter(function(elem, index, self) {
        return index === self.indexOf(elem);
      });
    });
  }

  startGame() {
    this.db.setStart(this.id);
  }

}
