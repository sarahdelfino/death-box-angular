import { Component, OnInit } from '@angular/core';
import { GameService } from './game.service';
import { SocketService } from './socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [GameService]
})
export class AppComponent implements OnInit {

  title = 'socketio-angular';

  constructor(private socketService: SocketService) {}

  ngOnInit() {
    this.socketService.setupSocketConnection();
  }

}

