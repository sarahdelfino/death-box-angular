import { Component, OnInit } from '@angular/core';
import { GameService } from './game.service';
import * as io from 'socket.io-client';
import { SocketioService } from './socketio.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [GameService]
})
export class AppComponent implements OnInit {
  private socket: any;
  public data: any;

  constructor(private socketService: SocketioService) {
    // this.socket = io('http://127.0.0.1:3000');
  }

  ngOnInit() {
    // this.socketService.setupSocketConnection();
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }

}

