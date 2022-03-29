import { Component, OnInit } from '@angular/core';
import { GameService } from './game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [GameService]
})
export class AppComponent implements OnInit {


  constructor() {

  }

  ngOnInit() {

  }

  ngOnDestroy() {

  }

}

