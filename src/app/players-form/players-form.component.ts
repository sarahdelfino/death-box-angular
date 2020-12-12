import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, FormArray, FormGroup } from '@angular/forms';
import { GameService } from '../game.service';

@Component({
  selector: 'app-players-form',
  templateUrl: './players-form.component.html',
  styleUrls: ['./players-form.component.css']
})
export class PlayersFormComponent implements OnInit {

  playersForm: FormGroup;
  
  constructor(private formBuilder: FormBuilder,
    private gameService: GameService) {
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

  ngOnInit(): void {
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
    // console.log(data);
    this.gameService.addPlayers(data);
    // this.playersForm.reset();
  }

  addPlayer() {
    this.players().push(this.newPlayer());
  }
}
