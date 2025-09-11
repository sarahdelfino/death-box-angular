import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { DatabaseService } from '../database.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css'],
    standalone: false
})
export class NavbarComponent implements OnInit {

  isHost: boolean;
  currentPlayer: string;
  correctGuesses: any[];
  @Input() gameId: string;
  @Input() renderBack: boolean;
  @Input() correct: number;
  @Input() player: string;
  @Input() checks: number;
  @Output() backToBoard = new EventEmitter<boolean>();

  constructor(private db: DatabaseService) { }

  ngOnInit(): void {
      this.isHost = true;
      this.currentPlayer = this.player;
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    if (this.isHost == true && changes.player && changes?.player?.currentValue !== this.currentPlayer) {
      this.currentPlayer = changes.player.currentValue
    }
    if (changes?.correct?.currentValue) {
      console.log("TADAAAAAAA::::::", changes?.correct?.currentValue);
      this.correctGuesses = new Array(changes.correct.currentValue);
    } else {
      this.correctGuesses = new Array(0);
    }
  }

  goBack() {
    this.backToBoard.emit(true);
  }

}
