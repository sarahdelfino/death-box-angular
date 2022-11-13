import { Component, Input, SimpleChanges } from '@angular/core';
import { DatabaseService } from '../database.service';
import { Game } from '../game';
import { GameService } from '../game.service';

@Component({
  selector: 'app-count',
  templateUrl: './count.component.html',
  styleUrls: ['./count.component.css']
})
export class CountComponent {

  @Input() game: Game;
  @Input() players: any;
  public id: string;
  public currentCounter: string;
  public counting: boolean;
  public currentPlayer: string;
  public sessionPlayer = sessionStorage.getItem('player');
  public filteredPlayers = [];

  constructor(private db: DatabaseService,
    private gameService: GameService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);

    if (changes && changes.players && changes.players.firstChange) {
      console.log("PLAYERRRSSRSERSE: ", changes.players);
      this.currentCounter = changes.players.currentValue.filtered[0];
      this.filteredPlayers = changes.players.currentValue.filtered;
    } else if (this.game.counter) {
      this.currentCounter = this.game.counter;
    }
    console.log(this.game);
    this.id = this.game.id;
    // this.currentPlayer = this.players.currentValue.currentTurn;
    console.log(this.players.currentTurn);
  }

  count() {
    console.log("current counter: ", this.currentCounter);
    console.log(this.filteredPlayers);
    this.db.decrementSeconds(this.game.id);
    if (this.game.seconds > 1) {
      this.getNextCounter();
    } else {
      let timer = setTimeout(() => {
        this.db.endCounting(this.game.id);
        this.counting = false;
      }, 1000);
    }
  }

  getNextCounter() {
    const curCountIndex = this.filteredPlayers.indexOf(this.currentCounter);
    console.log(curCountIndex);
    let newIndex = curCountIndex + 1;
    if (newIndex == this.filteredPlayers.length) {
      newIndex = 0;
    }
    this.currentCounter = this.filteredPlayers[newIndex];
    console.log("next counter: ", this.currentCounter);
    this.db.setCounter(this.game.id, this.currentCounter);
  }

}
