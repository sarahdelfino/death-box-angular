import { Component, Input, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { DatabaseService } from '../database.service';
import { GameService } from '../game.service';

@Component({
  selector: 'app-count',
  templateUrl: './count.component.html',
  styleUrls: ['./count.component.css']
})
export class CountComponent implements OnInit {

  // @Input() player: string;
  public player: string;
  public id: string;
  public counting: boolean;

  constructor(private db: DatabaseService,
    private gameService: GameService) { }

  ngOnInit() {
    this.id = this.gameService.getId();
    this.db.getPlayers(this.gameService.getId()).valueChanges().subscribe(data => {
      console.log(data);
      for (let d in data) {
        if (data[d].currentPlayer) {
          console.log(data[d]);
          console.log(data[d].name);
          this.player = data[d].name;
        }
      }
    });
    this.db.getGame(this.id).valueChanges().subscribe(gameData => {
      console.log(gameData);
      if (gameData.counting && gameData.seconds) {
        this.counting = true;
      }
    })
    // console.log(localStorage.getItem('user'));
    // if (localStorage.getItem('user') == this.player) {
    //   console.log("hey!!!!!");
    // }
    // console.log(this.player);
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      const chng = changes[propName];
      const cur = JSON.stringify(chng.currentValue);
      console.log(chng);
    }
    console.log(this.player);
  }


  count() {
    // console.log("hello");
    console.log(this.counting);
    if (localStorage.getItem('user') == this.player && this.counting == true) {
      console.log("hey!!!!!");
      this.db.decrementSeconds(this.id);
      this.counting = false;
      console.log(this.counting);
      this.db.deleteCounting(this.id);
      // count 
    }
  }

}
