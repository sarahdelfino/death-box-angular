import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { nanoid } from "nanoid";
import { Game } from '../game';
import { MatDialog, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatabaseService } from '../database.service';
import { GameService } from '../game.service';
import { InfoComponent } from '../info/info.component';

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

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dbService: DatabaseService,
    private dialog: MatDialog,
    private gameService: GameService
    
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

  onClick() {
    const dialogConfig = new MatDialogConfig();

    const dialogRef = this.dialog.open(InfoComponent);
  }

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
    // this.socketService.setupSocketConnection(this.game);
    // console.log(this.game.players);
    // this.dbService.create(this.game).then(() => {
    //   console.log("created new game");
    // });
    console.log(this.game);
    let deck = this.gameService.createDeck();
    let stacks = this.gameService.createStacks(deck);
    console.log(stacks);
    this.dbService.create(this.game, deck, stacks);
    // this.dbService.addPlayer(this.game.id, this.game.host);
    // this.dbService.addPlayer(this.game.id, [{player: this.game.host, seconds: 0}]);
    localStorage.setItem('user', this.game.host);
    localStorage.setItem('host', 'true');
    this.router.navigateByUrl(`/lobby/${this.game.id}`);
  }

  joinGame(joinFormData) {
    console.log(joinFormData);
    // console.log(this.game.players);
    this.dbService.addPlayer(joinFormData.id, joinFormData.name);
    localStorage.setItem('user', joinFormData.name);
    localStorage.setItem('host', 'false');
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
