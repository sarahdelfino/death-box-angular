import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  isHost: boolean;
  currentPlayer: string;
  correctGuesses: Array<number>;
  @Input() gameId: string;
  @Input() renderBack: boolean;
  @Input() correct: number;
  @Input() player: string;
  @Output() backToBoard = new EventEmitter<boolean>();

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
      this.correctGuesses = new Array(changes.correct.currentValue);
    }
  }

  goBack() {
    this.backToBoard.emit(true);
  }

}
