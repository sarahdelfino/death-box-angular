import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { DatabaseService } from '../database.service';
import { GameService } from '../game.service';

@Component({
  selector: 'app-count',
  templateUrl: './count.component.html',
  styleUrls: ['./count.component.css']
})
export class CountComponent implements OnInit {

  @Input() counter: string;
  public id: string;
  public counting: boolean;
  public currentPlayer = sessionStorage.getItem('user');
  public filteredPlayers = [];

  constructor(private db: DatabaseService,
    private gameService: GameService) { 
    }

  ngOnInit() {
    this.id = this.gameService.getId();
    this.db.getPlayers(this.gameService.getId()).valueChanges().subscribe(data => {
      this.filteredPlayers = [];
      for (const d in data) {
        if (!data[d].currentPlayer) {
          this.filteredPlayers.push(data[d]);
          this.counter = this.filteredPlayers[0].name;
        }
      }
    });
    this.db.getGame(this.id).valueChanges().subscribe(gameData => {
      if (gameData.counting && gameData.seconds) {
        this.counting = true;
        if (gameData.counter) {
          this.counter = gameData.counter;
        }
      } else if (!gameData.counting) {
        this.counting = false;
      }
    })
  };

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      const chng = changes[propName];
      const cur = JSON.stringify(chng.currentValue);
      console.log(cur);
    }
  }


  count() {
    if (sessionStorage.getItem('user') === this.counter && this.counting === true) {
      this.db.decrementSeconds(this.id);
      if (this.filteredPlayers.length > 1) {
        this.getNextCounter();
      }
    }
  }

  getNextCounter() {
    const curCountIndex = this.filteredPlayers.map(function(e) { return e.name; }).indexOf(this.counter);
    let newIndex = curCountIndex + 1;
    if (newIndex == this.filteredPlayers.length) {
      newIndex = 0;
    }
    this.counter = this.filteredPlayers[newIndex].name;
    this.db.setCounter(this.id, this.counter);
  }

}
