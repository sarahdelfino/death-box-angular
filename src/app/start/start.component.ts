import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { SocketioService } from '../socketio.service';
import { nanoid } from "nanoid";
import { Game } from '../game';
import { DatabaseService } from '../database.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css']
})
export class StartComponent implements OnInit {
  game: Game;
  createGameForm: FormGroup;
  joinGameForm: FormGroup;
  submitted = false;
  name: string;
  currentGame: string;

  constructor(private socketService: SocketioService,
    private formBuilder: FormBuilder,
    private router: Router,
    private dbService: DatabaseService,
    
    ) { }

  ngOnInit() {
    this.createGameForm = this.formBuilder.group({
      host: ['', [Validators.required, Validators.minLength(2)]],
    });
    this.joinGameForm = this.formBuilder.group({
      id: '',
      name: ''
    });
    // this.socketService.setupSocketConnection();
  }

  get f() { return this.createGameForm.controls; }

  onSubmit(formData) {
    this.submitted = true;
    // stop here if form invalid
    if (this.createGameForm.invalid) {
      return;
    }
    this.createGame(formData)
  }

  createGame(formData) {
    this.createGameId(formData.host);
    console.log(formData.host);
    this.socketService.setupSocketConnection(this.game);
    console.log(this.game.players);
    // this.dbService.create(this.game).then(() => {
    //   console.log("created new game");
    // });
    this.dbService.create(this.game);
    this.router.navigateByUrl(`/lobby/${this.game.id}`);
  }

  joinGame(joinFormData) {
    console.log(joinFormData);
    this.socketService.joinGame(joinFormData);
    // console.log(this.game.players);
    this.dbService.update(joinFormData.id, joinFormData.name);
    this.router.navigateByUrl(`/lobby/${joinFormData.id}`);
  }

  onReset() {
    this.submitted = false;
    this.createGameForm.reset();
}

  createGameId(host) {
    console.log(host);
    var id = nanoid(5);
    this.game = new Game(id, host, [host]);
  }

}
