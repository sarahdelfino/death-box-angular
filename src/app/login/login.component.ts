import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { DatabaseService } from '../database.service';
import { Game } from '../game';
import { nanoid } from "nanoid";
import { MatTabGroup, MatTab } from '@angular/material/tabs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  game: Game;
  loggedIn: boolean;

  constructor(
    public authService: AuthService,
    private router: Router,
    private dbService: DatabaseService,
  ) { }

  ngOnInit() {
    if (this.authService.isLoggedIn) {
      this.loggedIn = true;
    } else {
      this.loggedIn = false;
    }
  }

  createGame() {
    this.createGameId();
    sessionStorage.setItem('host', 'true');
    this.dbService.create(this.game);
    this.router.navigateByUrl(`/lobby/${this.game.id}`);
  }

  createGameId() {
    var id = nanoid(5);
    this.game = new Game(id, false,);
  }

}
