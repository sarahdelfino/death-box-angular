import { ThrowStmt } from '@angular/compiler';
import { Component, Input, OnInit, SimpleChanges, Output, EventEmitter } from '@angular/core';
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
  // seconds: number[] = [];
  id: string;
  currentPlayer: string;
  changeLog = [];
  // turns = 0;

  @Input() public turn: number;
  @Input() seconds: number;

  @Output() curCounter = new EventEmitter<string>();



  constructor(private db: DatabaseService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getId();
    this.getPlayers();
    // this.currentPlayer = this.players[0];
    this.db.getCurrentPlayer(this.id).valueChanges().subscribe(data => {
      this.currentPlayer = data;
      // console.log(this.currentPlayer);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      const chng = changes[propName];
      const cur = JSON.stringify(chng.currentValue);
      // console.log(chng.currentValue);
      if (this.currentPlayer && cur == '0') {
        // console.log(this.currentPlayer);
        this.setCurrentPlayer(this.currentPlayer);
        this.curCounter.emit(this.currentPlayer);
      }
    }
    if (this.seconds) {
      this.setPlayerScore(this.currentPlayer, this.seconds);
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
    })

  }

  setPlayerScore(player: string, seconds: number) {
    for (let p in this.players) {
      if (this.players[p].name == player) {
        this.players[p] = {
          name: player,
          seconds: this.players[p].seconds + seconds
        }
      }
    }
    console.log(this.players);
    this.db.updateSeconds(this.id, this.players);
    this.seconds = 0;
    this.players = [];
  }

  getCurrentPlayer(id: string) {
    this.db.getCurrentPlayer(id).valueChanges().subscribe(data => {
      this.currentPlayer = data;
      console.log(this.currentPlayer);
    })
  }

  setCurrentPlayer(player: any) {
    var currIndex = this.players.findIndex(p => p.name === player);
    if (currIndex < this.players.length - 1) {
      this.db.setCurrentPlayer(this.id, this.players[currIndex + 1].name);
    } else {
      this.db.setCurrentPlayer(this.id, this.players[0].name);
    }
  }


}
