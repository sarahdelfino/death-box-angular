import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Game } from '../game';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DatabaseService } from '../database.service';
import { InfoComponent } from '../info/info.component';
import { nanoid } from "nanoid";
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { element } from 'protractor';

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
  joinClicked: boolean;
  isMobile: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dbService: DatabaseService,
    private dialog: MatDialog,
    protected $gaService: GoogleAnalyticsService
  ) { 
    this.createForm();
  }

  ngOnInit() {
    this.$gaService.pageView('/', 'home page load');
    if (window.innerWidth < 500) {
      this.isMobile = true;
    }
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

  createGame() {
    this.createGameId();
    sessionStorage.setItem('host', 'true');
    this.dbService.create(this.game);
    this.router.navigateByUrl(`/lobby/${this.game.id}`);
  }

  joinTrigger() {
    if (this.joinClicked) {
      this.joinClicked = false;
      let el = document.getElementById('container');
      el.scrollIntoView();
    } else {
      this.joinClicked = true;
      let el = document.getElementById('join');
      el.scrollIntoView();
    }
  }

  createGameId() {
    var id = nanoid(5);
    this.game = new Game(id, false,);
  }
}
