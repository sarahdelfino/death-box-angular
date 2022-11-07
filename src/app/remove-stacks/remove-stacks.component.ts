import { Component, OnInit } from '@angular/core';

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
