import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
// import { nanoid } from "nanoid";
import { Game } from '../game';
import { MatDialog, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatabaseService } from '../database.service';
import { GameService } from '../game.service';
import { InfoComponent } from '../info/info.component';
import { LoginComponent } from '../login/login.component';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css']
})
export class StartComponent implements OnInit {

  game: Game;
  joinGameForm: FormGroup;
  submitted = false;
  name: string;
  currentGame: string;
  loggedIn: boolean;

  constructor(
    public authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private dbService: DatabaseService,
    private dialog: MatDialog,
  ) { 
    this.createForm();
  }

  ngOnInit() {
    // if (this.authService.isLoggedIn) {
    //   this.loggedIn = true;
    // } else {
    //   this.loggedIn = false;
    // }
  }

  createForm(): void {
    this.joinGameForm = this.formBuilder.group({
      id: ['', [Validators.required, Validators.minLength(5)]],
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  infoClick() {
    const dialogConfig = new MatDialogConfig();
    const dialogRef = this.dialog.open(InfoComponent);
  }

  // createGame() {
  //   this.createGameId();
  //   sessionStorage.setItem('host', 'true');
  //   console.log(this.game);
  //   console.log(sessionStorage.getItem('host'));
  //   this.dbService.create(this.game);
  //   this.router.navigateByUrl(`/lobby/${this.game.id}`);
  // }

  openModal() {
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(LoginComponent, dialogConfig);
  }

  joinGame(joinFormData) {
    if (this.joinGameForm.invalid) {
      return;
    } else {
      this.dbService.addPlayer(joinFormData.id, joinFormData.name);
      sessionStorage.setItem('user', joinFormData.name);
      sessionStorage.setItem('host', 'false');
      this.router.navigateByUrl(`/lobby/${joinFormData.id}`);
    }
  }

  onReset() {
    this.submitted = false;
  }

  // createGameId() {
  //   var id = nanoid(5);
  //   this.game = new Game(id, false,);
  // }

}
