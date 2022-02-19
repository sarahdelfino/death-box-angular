import { Component, Input, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { DatabaseService } from '../database.service';
import { GameService } from '../game.service';

@Component({
  selector: 'app-count',
  templateUrl: './count.component.html',
  styleUrls: ['./count.component.css']
})
export class CountComponent implements OnInit {

  @Input() player: string;

  constructor(private db: DatabaseService,
    private gameService: GameService) { }

  ngOnInit() {
    // this.db.getPlayers(this.gameService.getId()).valueChanges().subscribe(data => {
    //   console.log(data);
    // });
    console.log(localStorage.getItem('user'));
    if (localStorage.getItem('user') == this.player) {
      console.log("hey!!!!!");
    }
    console.log(this.player);
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      const chng = changes[propName];
      const cur = JSON.stringify(chng.currentValue);
      console.log(chng);
    }
  }


  count() {
    console.log("hello");
  }

}
