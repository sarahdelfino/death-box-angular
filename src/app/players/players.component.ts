// import { ThrowStmt } from '@angular/compiler';
import { Component, Input, OnInit, SimpleChanges, Output, EventEmitter, AfterContentChecked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../database.service';
import { Game } from '../game';
import { GameService } from '../game.service';
import { Player } from '../player';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent implements OnInit {
  // players: any[] = [];
  id: string;
  currentPlayer: string;
  playerList: any[] = [];
  changeLog = [];
  isHost: boolean;
  counter = 0;

  // @Input() public turn: number;
  // @Input() seconds: number;
  @Input() player: string;


  // @Output() curPlayer = new EventEmitter<string>();
  // @Output() playerList = new EventEmitter<string[]>();



  constructor(private db: DatabaseService,
    private route: ActivatedRoute,
    private gameService: GameService
  ) {
    console.log(this.player);
    // this.getId();
    // // this.getPlayers();
    // if (sessionStorage.getItem('host') == 'true') {
    //   this.isHost = true;
    // } else {
    //   this.isHost = false;
    // }

  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    if (changes.player.currentValue !== this.currentPlayer) {
      this.currentPlayer = changes.player.currentValue
    }
  }

  ngAfterContentChecked() {
    // if (this.players && this.players[0].name && !this.currentPlayer) {
    //   this.players[0].currentPlayer = true;
    // this.currentPlayer = this.players[0].name;
    // this.curPlayer.emit(this.currentPlayer);
    // this.db.setCurrentPlayer(this.id, this.currentPlayer);
    // this.db.updatePlayers(this.id, this.players);
    // }
  }

  getId(): void {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  setPlayerScore(player: string, seconds: number) {
    // for (let p in this.players) {
    //   if (this.players[p].name == player) {
    //     this.players[p].secondsDrank = this.players[p].secondsDrank + seconds;
    //     this.db.updatePlayers(this.id, this.players);
    //     this.seconds = 0;
    //   }
    // }
  }

  getNextPlayer(playerIndex: any) {
    // this.gameService.getNextPlayer(playerIndex, this.players);
  }
}
