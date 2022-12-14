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
  @Input() currentPlayer: any;
  public id: string;
  public currentCounter: string;
  public counting: boolean;
  // public currentPlayer: string;
  public sessionPlayer = sessionStorage.getItem('player');
  public filteredPlayers = [];

  constructor(private db: DatabaseService,
    private gameService: GameService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    // take in player obj
    // on changes filter and map
    console.log(changes);

    if (changes && changes.players && changes.players.firstChange) {
      console.log("PLAYERRRSSRSERSE: ", changes.players);
      console.log("^^^^^^^^^^^^", changes.players.currentValue.filtered);
      this.filteredPlayers = changes.players.currentValue.filtered;
      this.currentCounter = this.filteredPlayers[0];  
    }
    console.log(this.game);
    this.id = this.game.id;
    console.log(this.players);
    
    // this.currentPlayer = this.players.currentValue.currentTurn;
    console.log("current turn: ", this.players.currentTurn, this.currentPlayer);
    console.log("session: ", this.sessionPlayer);
    console.log("counter: ", this.currentCounter);
  }

  count() {
    console.log("current counter: ", this.currentCounter);
    console.log("filtered: ", this.filteredPlayers);
    this.db.decrementSeconds(this.game.id);
    if (this.game.seconds > 0) {
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
