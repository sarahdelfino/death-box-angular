import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../database.service';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent implements OnInit {
  id: string;
  currentPlayer: string;
  playerList: any[] = [];
  changeLog = [];
  isHost: boolean;
  counter = 0;
  @Input() player: string;

  constructor(private db: DatabaseService,
    private route: ActivatedRoute,
  ) {
    console.log(this.player);
      }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    if (changes.player.currentValue !== this.currentPlayer) {
      this.currentPlayer = changes.player.currentValue
    }
  }

  getId(): void {
    this.id = this.route.snapshot.paramMap.get('id');
  }

}
