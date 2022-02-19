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
  id: string;
  currentPlayer: string;
  changeLog = [];
  isHost: boolean;

  @Input() public turn: number;
  @Input() seconds: number;

  @Output() curCounter = new EventEmitter<string>();



  constructor(private db: DatabaseService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getId();
    this.getPlayers();
    if (localStorage.getItem('host') == 'true') {
      this.isHost = true;
    } else {
      this.isHost = false;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      const chng = changes[propName];
      const cur = JSON.stringify(chng.currentValue);
      console.log(chng);
      if (chng.firstChange == false &&
        this.currentPlayer &&
        cur == '0') {
        // get new player
        this.getNextPlayer(this.players.findIndex(p => p.name === this.currentPlayer));
      }
    }
    if (this.seconds && this.seconds != 0) {
      this.setPlayerScore(this.currentPlayer, this.seconds);
    }
  }

  getId(): void {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  getPlayers() {
    this.db.getPlayers(this.id).valueChanges().subscribe(data => {
      console.log(data);
      this.players = []
      for (let x in data) {
        this.players.push(data[x]);
        if (data[x].currentPlayer) {
          this.currentPlayer = data[x].name;
        }
      }
    });
  }

  setPlayerScore(player: string, seconds: number) {
    console.log(this.players);
    for (let p in this.players) {
      if (this.players[p].name == player) {
        console.log("EX: " + this.players[p].secondsDrank + " SEC: " + seconds);
        this.players[p].secondsDrank = this.players[p].secondsDrank + seconds;
        console.log(this.players);
        this.db.updatePlayers(this.id, this.players);
        this.seconds = 0;
      }
    }
  }

  getNextPlayer(playerIndex: any) {
    let newIndex = 0;

    delete this.players[playerIndex].currentPlayer;

    if (playerIndex == this.players.length - 1) {
      this.players[newIndex].currentPlayer = true;
      // this.currentPlayer = this.players[newIndex];
    } else {
      newIndex = playerIndex + 1;
      this.players[newIndex].currentPlayer = true;
      // this.currentPlayer = this.players[newIndex];
    }
    this.db.updatePlayers(this.id, this.players);
  }

}
