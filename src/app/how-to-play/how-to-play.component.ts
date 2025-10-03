import { Component, inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-how-to-play',
  imports: [CommonModule, MatDialogModule],
  templateUrl: './how-to-play.component.html',
  styleUrls: ['./how-to-play.component.scss']
})
export class HowToPlayComponent {
  private router = inject(Router);
  shortened = false;

  constructor() {
    // auto-shortened in "play" route
    if (this.router.url.includes('play')) {
      this.shortened = true;
    }
  }

  toggleVersion() {
    this.shortened = !this.shortened;
  }
}
