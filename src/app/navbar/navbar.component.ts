import { Component, EventEmitter, inject, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {

  private dialog = inject(MatDialog);

  currentPlayer: string = '';
  correctGuesses: any[] = [];
  infoClicked = false;
  @Input() isCurrentTurn = false;
  @Input() gameId: string = '';
  @Input() correct: number = 0;
  @Input() player: string = '';

  ngOnInit(): void {
    this.currentPlayer = this.player;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['player'] && changes['player']?.currentValue !== this.currentPlayer) {
      this.currentPlayer = changes['player'].currentValue
    }
    if (changes['correct']?.currentValue) {
      this.correctGuesses = new Array(changes['correct'].currentValue);
    } else {
      this.correctGuesses = new Array(0);
    }
  }

}
