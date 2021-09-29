import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../database.service';
import { Player } from '../player';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent implements OnInit {
  players: any[] = [];
  seconds: number[] = [];
  id: string;
  currentPlayer: string;
  changeLog = [];
  // turns = 0;

  @Input()
  public turn: number;


  constructor(private db: DatabaseService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getId();
    this.getPlayers();
    this.db.getCurrentPlayer(this.id).valueChanges().subscribe(data => {
      this.currentPlayer = data;
      console.log(this.currentPlayer);
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      const chng = changes[propName];
      const cur = JSON.stringify(chng.currentValue);
      console.log(chng.currentValue);
      if (this.currentPlayer && cur == '0') {
        console.log(this.currentPlayer);
        this.setCurrentPlayer(this.currentPlayer);
      }
    }
  }

  getId(): void {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  getPlayers() {
    this.db.getPlayers(this.id).valueChanges().subscribe(data => {
      for (let x in data) {
        this.players.push(data[x]);
      }
      console.log(this.players);
    })

  }

  getCurrentPlayer(id: string) {
    this.db.getCurrentPlayer(id).valueChanges().subscribe(data => {
      this.currentPlayer = data;
      console.log(this.currentPlayer);
    })
  }

  setCurrentPlayer(player: any) {
    var currIndex = this.players.findIndex(p => p.name === player.name);
    if (currIndex < this.players.length - 1) {
      this.db.setCurrentPlayer(this.id, this.players[currIndex + 1]);
    } else {
      this.db.setCurrentPlayer(this.id, this.players[0]);
    }
  }


}
