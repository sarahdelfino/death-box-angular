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

  @Input() public turn: number;
  @Input() seconds: number;

  @Output() curCounter = new EventEmitter<string>();



  constructor(private db: DatabaseService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getId();
    // this.getPlayers();
    this.db.getPlayers(this.id).valueChanges().subscribe(data => {
      this.players = []
      // initial grab
      // if (this.players.length == 0 || this.players == null || this.players == undefined) {
      for (let x in data) {
        this.players.push(data[x]);
        if (data[x].currentPlayer) {
          this.currentPlayer = data[x].name;
        }
      }
      // console.log(this.turn);
      //   // this.players.push(data[x]);
      // } else {
      //   for (let y in data) {
      //     if (data[y].currentPlayer) {
      //       this.setPlayerScore(data[y].name, parseInt(data[y].secondsDrank));
      //     }
      //   }
      // }
      // this.players.push(data);
      // console.log({ heyYYYYYYYYY: data});
      // this.players = data;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      const chng = changes[propName];
      const cur = JSON.stringify(chng.currentValue);
      // console.log(chng.currentValue);
      console.log(chng);
      if (chng.firstChange == false &&
        this.currentPlayer &&
        cur == '0') {
        console.log(this.currentPlayer);
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
      for (let x in data) {
        if (data[x].currentPlayer) {
          this.currentPlayer = data[x].name;
        }
        this.players.push(data[x]);
      }
    });
    console.log(this.currentPlayer);
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

  getCurrentPlayer(id: string) {
    this.db.getCurrentPlayer(id).valueChanges().subscribe(data => {
      this.currentPlayer = data;
      console.log(this.currentPlayer);
    });
    return this.currentPlayer;
  }

  getNextPlayer(playerIndex: any) {
    let newIndex = 0;

    delete this.players[playerIndex].currentPlayer;

    if (playerIndex == this.players.length - 1) {
      this.players[newIndex].currentPlayer = true;
    } else {
      newIndex = playerIndex + 1;
      this.players[newIndex].currentPlayer = true;
    }
    this.db.updatePlayers(this.id, this.players);
  }

}
