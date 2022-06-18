import { Component, Inject, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DatabaseService } from '../database.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit, OnDestroy {
  public title?: string;
  public body?: string;
  public currentPlayer?: string;
  public subscription: Subscription;
  uiCounter: number;
  wrongGuess: boolean;
  text: string;
  id: string;

  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    private db: DatabaseService,
    @Inject(MAT_DIALOG_DATA) data) {
      this.id = data.id;
    this.title = data.title;
    // this.body = data.body;
    // this.currentPlayer = data.currentPlayer;
    console.log(data);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    if (this.title === 'Nope!') {
      this.subscription = this.db.getGame(this.id).valueChanges().subscribe((c) => {
        console.log(c);
        this.uiCounter = c.seconds;
        console.log(this.uiCounter);
      });
      if (this.uiCounter == 1) {
        this.text = "second";
      } else {
        this.text = "seconds";
      }
      if (this.uiCounter == 0) {
        let timer = setTimeout(() => {
          this.dialogRef.close();
        }, 1000);
      }
      this.db.updateCounting(this.id);
      this.wrongGuess = true;
    } else {
      let timer = setTimeout(() => {
        this.dialogRef.close();
      }, 1000);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      const chng = changes[propName];
      const cur = JSON.stringify(chng.currentValue);
      console.log(cur);
    }
  }

  ngOnDestroy() {
    // end counting & delete seconds
    this.db.endCounting(this.id);
    this.subscription.unsubscribe();
  }

}
