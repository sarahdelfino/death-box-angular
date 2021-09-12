import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  public title?: string;
  public body?: string;
  public currentPlayer?: string;

  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    this.title = data.title;
    this.body = data.body;
    this.currentPlayer = data.currentPlayer;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
  }

}
