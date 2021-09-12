import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { SocketioService } from '../socketio.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css']
})
export class StartComponent implements OnInit {
  createGameForm: FormGroup;
  joinGameForm: FormGroup;
  games: Observable<string[]>;
  name: string;
  currentGame: string;
  private _gameSub: Subscription;

  constructor(private socketService: SocketioService,
    private formBuilder: FormBuilder,
    private router: Router) { }

  ngOnInit() {
    this.createGameForm = this.formBuilder.group({
      host: ''
    });
    this.joinGameForm = this.formBuilder.group({
      id: '',
      name: ''
    });
    // this.socketService.setupSocketConnection();
  }

  createGame(formData) {
    console.log(formData.host);
    this.socketService.setupSocketConnection(formData.host);
    this.createGameForm.reset();
    this.router.navigateByUrl('/lobby');
  }

  joinGame(joinFormData) {
    console.log(joinFormData);
    this.socketService.joinGame(joinFormData);
  }

}
