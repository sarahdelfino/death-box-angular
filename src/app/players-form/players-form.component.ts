import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, FormArray, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
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
  
  constructor(private formBuilder: FormBuilder,
    private gameService: GameService,
    // private dialogRef: MatDialogRef,
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
    // this.dialogRef.close(data);
    this.router.navigateByUrl('/play', { state: data });
    // this.playersForm.reset();
  }

  addPlayer() {
    this.players().push(this.newPlayer());
  }
}
