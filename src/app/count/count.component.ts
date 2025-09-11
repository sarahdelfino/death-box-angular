import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { DatabaseService } from '../database.service';
import { Game } from '../game';

@Component({
    selector: 'app-count',
    templateUrl: './count.component.html',
    styleUrls: ['./count.component.css'],
    standalone: false
})
export class CountComponent {

  @Input() game: Game;
  @Output() nextCounter = new EventEmitter<string>();
  public id: string;
  public currentCounter: string;
  public counting: boolean;
  public text = '';
  public sessionPlayer = sessionStorage.getItem('player');

  constructor(private db: DatabaseService) {
      
  }

  ngOnChanges() {
    this.currentCounter = this.game.counter;
    if (this.game.seconds == 1) {
      this.text = "second";
    } else {
      this.text = "seconds";
    }
  }

  count() {
    this.db.decrementSeconds(this.game.id).then(() => {
      console.log("successfully decremented seconds");
      if (this.game.seconds > 0) {
        this.nextCounter.emit(this.currentCounter);
      } else {
          this.db.endCounting(this.game.id);
          this.counting = false;
      }
    });
  }

}
