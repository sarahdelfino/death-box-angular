import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css']
})
export class StartComponent implements OnInit, OnDestroy {
  games: Observable<string[]>;
  currentGame: string;
  private _gameSub: Subscription;

  constructor(private gameService: GameService) { }

  ngOnInit() {
    this.games = this.gameService.games;
    this._gameSub = this.gameService.currentGame.subscribe(game => this.currentGame = game._id);
  }

  ngOnDestroy() {
    this._gameSub.unsubscribe();
  }

  loadGame(id: string) {
    this.gameService.getGame(id);
  }

  newGame() {
    this.gameService.newGame();
  }

}
