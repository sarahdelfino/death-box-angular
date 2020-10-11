import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-high-low',
  templateUrl: './high-low.component.html',
  styleUrls: ['./high-low.component.css']
})
export class HighLowComponent implements OnInit {

  card: string;

  constructor(
    // private dialog: MatDialog,
    private dialogRef: MatDialogRef<HighLowComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    this.card = data;
  }

  ngOnInit() {

  }

  higher() {
    console.log("You chose higher");
    this.dialogRef.close(this.card);
  }

  lower() {
    console.log("You chose lower");
    this.dialogRef.close(this.card);
  }



}
