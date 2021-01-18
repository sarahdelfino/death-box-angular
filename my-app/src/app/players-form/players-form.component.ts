import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, FormArray, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { GameService } from '../game.service';
import { HighLowComponent } from '../high-low/high-low.component';
import { Player } from '../player';

@Component({
  selector: 'app-players-form',
  templateUrl: './players-form.component.html',
  styleUrls: ['./players-form.component.css']
})
export class PlayersFormComponent implements OnInit {

  playersForm: FormGroup;
  userCount = 0;
  destroy$: Subject<boolean> = new Subject<boolean>();
  
  constructor(private formBuilder: FormBuilder,
    private gameService: GameService,
    private router: Router) {
   }

  ngOnInit() {
    this.playersForm = this.formBuilder.group({
      player1: '',
      player2: '',
      player3: '',
      player4: '',
      player5: '',
      player6: '',
      player7: '',
      player8: '',
      // players: this.formBuilder.array([]),
    });
  }

  players() : FormArray {
    return this.playersForm.get("players") as FormArray
  }

  newPlayer(): FormGroup {
    return this.formBuilder.group({
      player: '',
    })
  }

  onSubmit(data) {
    console.log("TS DATA: ", data);
    this.gameService.addPlayers(data);
    this.router.navigateByUrl('/play');

    // API stuff below
    this.gameService.addUser(this.playersForm.value).pipe().subscribe(data => {
      console.log('message::::', data);
      this.userCount = this.userCount + 1;
      console.log(this.userCount);
      this.playersForm.reset();
    });
    this.playersForm.reset();
  }

  addPlayer() {
    this.players().push(this.newPlayer());
  }
}
