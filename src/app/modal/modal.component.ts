import { Component, Inject, OnInit, OnDestroy, SimpleChanges, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DatabaseService } from '../database.service';
import { Game } from '../game';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit, OnDestroy {
  public title?: string;
  public body?: string;
  public currentPlayer?: string;
  public uiCounter: number;
  wrongGuess: boolean;
  public text: string;
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
    this.uiCounter = 0;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    if (this.title === 'Nope!') {
      this.db.updateCounting(this.id);
      this.wrongGuess = true;
      this.db.getGame(this.id).valueChanges().subscribe(c => {
        // this.handleSeconds(c.seconds);
        this.uiCounter = c.seconds;
      });
      // this.db.getGame(this.id).valueChanges().subscribe(c => {
      //   console.log(c);
      //   this.uiCounter = c.seconds;
      //   if (this.uiCounter == 1) {
      //     this.text = "second";
      //   } else {
      //     this.text = "seconds";
      //   }
      //   if (this.uiCounter == 0) {
      //     let timer = setTimeout(() => {
      //       this.dialogRef.close();
      //     }, 1000);
      //   }
      // });
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
    // this.subscription.unsubscribe();
  }

  // handleSeconds(seconds: number) {
  //   console.log(seconds);
  //   let tmp = [];
  //   tmp.push(seconds);
  //   console.log(tmp);
  //   this.uiCounter = tmp[0];
  // }

}
