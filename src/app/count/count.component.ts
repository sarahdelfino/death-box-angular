import { Component, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { DatabaseService } from '../database.service';
import { Game } from '../game';
import { GameService } from '../game.service';

@Component({
  selector: 'app-count',
  templateUrl: './count.component.html',
  styleUrls: ['./count.component.css']
})
export class CountComponent implements OnInit {

  @Input() game: any;
  @Input() players: any;
  // @Output() currentCounter: string;
  public id: string;
  public currentCounter: string;
  public counting: boolean;
  public sessionPlayer = sessionStorage.getItem('player');
  public filteredPlayers = [];

  constructor(private db: DatabaseService,
    private gameService: GameService) {
  }

  ngOnInit() {
    // this.id = this.gameService.getId();
    // console.log(this.game);
    // console.log(this.players);
    // this.filteredPlayers = this.players.filtered;
    // console.log(this.filteredPlayers);
    // console.log(this.sessionPlayer);
    // this.currentCounter = this.filteredPlayers[0];
    // console.log(this.currentCounter);
    // console.log("heeeeere");
    // this.db.getPlayers(this.gameService.getId()).valueChanges().subscribe(data => {
    //   this.filteredPlayers = [];
    //   for (const d in data) {
    //     if (!data[d].currentPlayer) {
    //       this.filteredPlayers.push(data[d]);
    //       this.counter = this.filteredPlayers[0].name;
    //     }
    //   }
    // });
    // this.db.getGame(this.id).valueChanges().subscribe(gameData => {
    //   if (gameData.counting && gameData.seconds) {
    //     this.counting = true;
    //     if (gameData.counter) {
    //       this.counter = gameData.counter;
    //     }
    //   } else if (!gameData.counting) {
    //     this.counting = false;
    //   }
    // });
    // console.log(this.counting);
  };

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    console.log(changes.players.currentValue.filtered);

    let counters = changes.players.currentValue.filtered;

    if (changes.players.firstChange) {
      this.currentCounter = counters[0];
    } else {
      let i = 0;
      
    }
  }

  ngOnDestroy() {
    // this.db.deleteCounting(this.id);
    // this.db.deleteSeconds(this.id);
  }


  count() {
    console.log(this.currentCounter);
    console.log(this.filteredPlayers);
    console.log(this.id);
    this.db.decrementSeconds(this.id);
    if (this.filteredPlayers) {
      this.getNextCounter();
    }
  }

  getNextCounter() {
    console.log("wooooooooooooooo");
    const curCountIndex = this.filteredPlayers.map(function (e) { return e.name; }).indexOf(this.currentCounter);
    let newIndex = curCountIndex + 1;
    if (newIndex == this.filteredPlayers.length) {
      newIndex = 0;
    }
    this.currentCounter = this.filteredPlayers[newIndex].name;
    this.db.setCounter(this.id, this.currentCounter);
    console.log(this.currentCounter);
  }

}
