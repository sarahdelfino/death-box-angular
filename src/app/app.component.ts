import { Component, OnInit } from '@angular/core';
import { GameService } from './game.service';
import * as io from 'socket.io-client';
import { SocketioService } from './socketio.service';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBgjfSBidyvXk8khmILej32MC1iJu7x89I",
  authDomain: "death-box-28ecf.firebaseapp.com",
  projectId: "death-box-28ecf",
  storageBucket: "death-box-28ecf.appspot.com",
  messagingSenderId: "917048488305",
  appId: "1:917048488305:web:5af3d89596a2d8deaf06d0",
  measurementId: "G-RMWB0565QP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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

