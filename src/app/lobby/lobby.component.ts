import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { Game } from '../game';
import { DatabaseService } from '../database.service';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { GameService } from '../game.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit, OnDestroy {
  id: string;
  host: string;
  playerList = [];
  game: Game | undefined;
  started: boolean;
  showJoinForm = false;
  isHost: boolean;
  joinGameForm: UntypedFormGroup;
  test: any;
  subscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private db: DatabaseService,
    private formBuilder: UntypedFormBuilder,
    private _gameService: GameService,
    protected $gaService: GoogleAnalyticsService
  ) {
    if (sessionStorage.getItem('host') == 'true') {
      this.isHost = true;
    } else {
      this.isHost = false;
    }
    this.getId();
    this.subscription = this.db.getGame(this.id).valueChanges().subscribe(data => {
      if (data) {
      this.started = data.started
    if (this.started == true) {
      this.router.navigateByUrl(`/play/${this.id}`);
    }
  } else {
    console.log("invalid game! reroute to homepage");

  }
  });
  }

  ngOnInit() {
    if (!sessionStorage.getItem('player')) {
      this.showJoinForm = true;
      this.createForm();
      const dialog: HTMLDialogElement = document.getElementById("dialog") as HTMLDialogElement;
      dialog.showModal();
      
    }
    this.$gaService.pageView('/lobby', 'lobby');
    this.getPlayers();
    // this._gameService.getPlayers().subscribe((players) => {
    //   console.log(players);
    // })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getId(): void {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  getPlayers() {
    this.db.getPlayers(this.id).valueChanges().subscribe(data => {
      console.log(data);
      this.playerList = Object.keys(data);
    });
  }

  createForm(): void {
    this.joinGameForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  joinGame(joinFormData) {
    if (this.joinGameForm.invalid) {
      return;
    } else {
      this.db.addPlayer(this.id, joinFormData.name);
      sessionStorage.setItem('player', joinFormData.name);
      sessionStorage.setItem('host', 'false');
      this.showJoinForm = false;
    }
  }

  inviteClicked() {
    console.log("invite clicked!");
    let url = `play deathbox with me! \ndeathbox.app/lobby/${this.id}`;
    navigator.clipboard.writeText(url);
  }

  startGame() {
    this.db.setStart(this.id).then(() => {
      console.log("successfully started game in db!");
    });
  }

}
