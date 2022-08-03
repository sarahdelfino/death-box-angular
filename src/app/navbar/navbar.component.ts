import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  playersView: boolean;
  @Input() correct: [];
  @Input() gameId: string;
  @Input() player: string;

  constructor() { }

  ngOnInit(): void {
    console.log(this.correct);
  }

  scoresClick() {
    if (this.playersView) {
      this.playersView = false
    } else {
      this.playersView = true;
    }
  }

}
