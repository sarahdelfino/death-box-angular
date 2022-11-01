import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  playersView: boolean;
  @Input() gameId: string;
  @Input() renderBack: boolean;
  @Output() backToBoard = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

  goBack() {
    this.backToBoard.emit(true);
  }

  scoresClick() {
    if (this.playersView) {
      this.playersView = false
    } else {
      this.playersView = true;
    }
  }

}
