import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Game } from '../game';
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
  createGameForm: FormGroup;
  submitted = false;
  name: string;
  create = false;
  currentGame: string;
  loggedIn: boolean;
  joinClicked = false;
  createClicked = false;
  isMobile: boolean;
  start = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dbService: DatabaseService,
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

    this.createGameForm = this.formBuilder.group ({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  // infoClick() {
  //   const dialogConfig = new MatDialogConfig();
  //   const dialogRef = this.dialog.open(InfoComponent);
  }

  joinGame(joinFormData) {
    if (this.joinGameForm.invalid) {
      return;
    } else {
      this.dbService.addPlayer(joinFormData.id, joinFormData.name);
      sessionStorage.setItem('player', joinFormData.name);
      sessionStorage.setItem('host', 'false');
      this.router.navigateByUrl(`/lobby/${joinFormData.id}`);
    }
  }

  onReset() {
    this.submitted = false;
  }

  createGame(createFormData) {
    this.createGameId();
    sessionStorage.setItem('host', 'true');
    sessionStorage.setItem('player', createFormData.name);
    this.dbService.create(this.game);
    this.dbService.addPlayer(this.game.id, createFormData.name, createFormData.name);
    this.router.navigateByUrl(`/lobby/${this.game.id}`);
  }

  joinTrigger() {
    if (this.joinClicked == true) {
      this.joinClicked = false;
    } else {
      this.joinClicked = true;
      this.createClicked = false;
    }
  }

  createTrigger() {
    if (this.createClicked == true) {
      this.createClicked = false;
    } else {
      this.createClicked = true;
      this.joinClicked = false;
    }
  }

  createGameId() {
    var id = nanoid(5);
    this.game = new Game(id, false,);
  }
}
