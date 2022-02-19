import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
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
  // @Output() game = new EventEmitter<Game>();
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
      id: ['', [Validators.required, Validators.minLength(5)]],
      name: ['', [Validators.required, Validators.minLength(2)]]
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
    } else {
      this.createGame(formData);
    }
  }

  createGame(formData) {
    this.createGameId(formData.host);
    console.log(this.game);
    this.dbService.create(this.game);
    localStorage.setItem('user', this.game.host);
    localStorage.setItem('host', 'true');
    this.router.navigateByUrl(`/lobby/${this.game.id}`);
  }

  joinGame(joinFormData) {
    if (this.joinGameForm.invalid) {
      return;
    } else {
      console.log(joinFormData);
      this.dbService.addPlayer(joinFormData.id, joinFormData.name);
      localStorage.setItem('user', joinFormData.name);
      localStorage.setItem('host', 'false');
      this.router.navigateByUrl(`/lobby/${joinFormData.id}`);
    }
  }

  onReset() {
    this.submitted = false;
    this.createGameForm.reset();
  }

  createGameId(host: string) {
    var id = nanoid(5);
    this.game = new Game(id, host, false, host);
  }

}
