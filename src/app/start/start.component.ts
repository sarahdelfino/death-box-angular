import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { nanoid } from 'nanoid';
import { GameStore } from '../game.store';
import { MatDialog } from '@angular/material/dialog';
import { HowToPlayComponent } from '../how-to-play/how-to-play.component';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss'],
})
export class StartComponent {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private store = inject(GameStore);
  private dialog = inject(MatDialog);

  joinGameForm: FormGroup = this.fb.group({
    id: ['', [Validators.required, Validators.minLength(5)]],
    name: ['', [Validators.required, Validators.minLength(2)]]
  });

  createGameForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]]
  });

  joinClicked = false;
  createClicked = false;
  isMobile = window.innerWidth < 500;
  infoClicked = false;

  toggleJoin(): void {
    this.joinClicked = !this.joinClicked;
    if (this.joinClicked) this.createClicked = false;
  }

  toggleCreate(): void {
    this.createClicked = !this.createClicked;
    if (this.createClicked) this.joinClicked = false;
  }

  toggleInfo(): void {
    this.infoClicked = true;
    this.dialog.open(HowToPlayComponent, {
      width: '400px',
      height: 'fit-content',
      panelClass: 'how-to-play-dialog',
    });
  }

  joinGame(name: string, id: string): void {
    console.log(name, id);
    if (!name || !id) { return }
    sessionStorage.setItem('player', name);
    sessionStorage.setItem('host', 'false');

    this.store.addPlayer({ gameId: id.toUpperCase(), playerName: name });
    // setTimeout(() => this.router.navigateByUrl(`/lobby/${id}`), 250);
    this.router.navigateByUrl(`/lobby/${id.toUpperCase()}`)
  }

  createGame(host: string): void {
    if (!host) { return }

    const id = nanoid(5).toUpperCase();
    const name = host;

    sessionStorage.setItem('player', name);
    sessionStorage.setItem('host', 'true');

    console.log(id, name);

    this.store.createGame({ gameId: id, playerName: name });
    this.router.navigateByUrl(`/lobby/${id}`)

    // setTimeout(() => this.router.navigateByUrl(`/lobby/${id}`), 250);
  }
}
