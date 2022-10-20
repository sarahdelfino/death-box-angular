import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { DatabaseService } from '../database.service';
import { GameService } from '../game.service';

@Component({
  selector: 'app-count',
  templateUrl: './count.component.html',
  styleUrls: ['./count.component.css']
})
export class CountComponent implements OnInit {

  @Input() counter: string;
  @Output() clickEmitter: EventEmitter<any> = new EventEmitter();
  public id: string;
  public counting: boolean;
  public currentPlayer = sessionStorage.getItem('user');
  public filteredPlayers = [];

  constructor(private db: DatabaseService,
    private gameService: GameService) { 
    }

  ngOnInit() {
    console.log(this.currentPlayer);
    this.id = this.gameService.getId();
    this.db.getPlayers(this.gameService.getId()).valueChanges().subscribe(data => {
      this.filteredPlayers = [];
      console.log(data);
      for (const d in data) {
        if (!data[d].currentPlayer) {
          console.log(this.filteredPlayers);
          this.filteredPlayers.push(data[d]);
          this.counter = this.filteredPlayers[0].name;
        }
      }
      console.log(this.filteredPlayers);
    });
    this.db.getGame(this.id).valueChanges().subscribe(gameData => {
      console.log(gameData.seconds);
      if (gameData.seconds && gameData.seconds !== 0) {
        this.counting = true;
        if (gameData.counter) {
          this.counter = gameData.counter;
        }
      } else if (gameData.seconds == 0) {
        // this.counting = false;
        console.log("hey");
      }
    });
    console.log(this.counting);
  };

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      const chng = changes[propName];
      const cur = JSON.stringify(chng.currentValue);
      console.log(cur);
    }
  }


  count() {
    console.log(this.counter);
    if (sessionStorage.getItem('user') === this.counter) {
      this.clickEmitter.emit();
      console.log(this.filteredPlayers);
      console.log(this.id);
      if (this.filteredPlayers) {
        this.getNextCounter();
      }
    }
  }

  getNextCounter() {
    console.log("wooooooooooooooo");
    const curCountIndex = this.filteredPlayers.map(function(e) { return e.name; }).indexOf(this.counter);
    let newIndex = curCountIndex + 1;
    if (newIndex == this.filteredPlayers.length) {
      newIndex = 0;
    }
    this.counter = this.filteredPlayers[newIndex].name;
    this.db.setCounter(this.id, this.counter);
    console.log(this.counter);
  }

}
