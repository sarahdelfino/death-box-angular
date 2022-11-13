import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Game } from '../game';
import { DatabaseService } from '../database.service';
import { nanoid } from "nanoid";
import { GoogleAnalyticsService } from 'ngx-google-analytics';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css']
})
export class StartComponent implements OnInit {

  game: Game;
  joinGameForm: UntypedFormGroup;
  createGameForm: UntypedFormGroup;
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
    private formBuilder: UntypedFormBuilder,
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
    this.dbService.createGame(this.game.id, createFormData.name);
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
