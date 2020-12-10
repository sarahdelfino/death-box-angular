import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, FormArray, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-players-form',
  templateUrl: './players-form.component.html',
  styleUrls: ['./players-form.component.css']
})
export class PlayersFormComponent implements OnInit {

  playersForm: FormGroup;
  
  constructor(private formBuilder: FormBuilder) {
    this.playersForm = this.formBuilder.group({
      player1: '',
      player2: '',
      players: this.formBuilder.array([]),
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

  onSubmit() {
    console.log(this.playersForm.value);
    this.playersForm.reset();
  }

  addPlayer() {
    this.players().push(this.newPlayer());
  }
}
