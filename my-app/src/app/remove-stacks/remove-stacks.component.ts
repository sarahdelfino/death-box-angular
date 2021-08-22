import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-remove-stacks',
  templateUrl: './remove-stacks.component.html',
  styleUrls: ['./remove-stacks.component.css']
})
export class RemoveStacksComponent {

  constructor(
    public dialogRef: MatDialogRef<RemoveStacksComponent>
  ) { }
  
  closeDialog(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
  }

}
