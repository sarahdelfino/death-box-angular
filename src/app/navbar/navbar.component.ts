import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  isHost: boolean;
  currentPlayer: string;
  @Input() gameId: string;
  @Input() renderBack: boolean;
  @Input() player: string;
  @Input() checks: number;
  @Output() backToBoard = new EventEmitter<boolean>();

  ngOnInit(): void {
    if (sessionStorage.getItem('host') == 'true') {
      this.isHost = true;
      this.currentPlayer = this.player;
    } else {
      this.isHost = false;
      this.currentPlayer = sessionStorage.getItem('player');
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.isHost == true && changes.player && changes?.player?.currentValue !== this.currentPlayer) {
      this.currentPlayer = changes.player.currentValue
    }
    console.log(changes);
  }

  goBack() {
    this.backToBoard.emit(true);
  }

}
