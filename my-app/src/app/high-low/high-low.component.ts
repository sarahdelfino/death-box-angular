import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Card } from '../card/card';

@Component({
  selector: 'app-high-low',
  templateUrl: './high-low.component.html',
  styleUrls: ['./high-low.component.css']
})
export class HighLowComponent implements OnInit {

  public card: Card;
  public choice: string;

  constructor(
    private dialogRef: MatDialogRef<HighLowComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    this.card = data[0];
  }

  ngOnInit() {

  }

  higher() {
    // console.log("You chose higher");
    this.choice = "higher";
    this.dialogRef.close(this.choice);
  }

  lower() {
    // console.log("You chose lower");
    this.choice = "lower";
    this.dialogRef.close(this.choice);
  }



}
