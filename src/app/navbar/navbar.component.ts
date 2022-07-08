import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  playersView: boolean;
  @Input() gameId: string;

  constructor() { }

  ngOnInit(): void {
  }

  scoresClick() {
    if (this.playersView) {
      this.playersView = false
    } else {
      this.playersView = true;
    }
  }

}
