import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  playersView: boolean;

  constructor() { }

  ngOnInit(): void {
  }

  scoresClick() {
    if (this.playersView) {
      this.playersView = false;
    } else {
      this.playersView = true;
    }
  }

}
