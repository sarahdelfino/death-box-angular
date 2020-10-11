import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameService } from '../game.service';
import { Card } from '../card/card';
import { HighLowComponent } from '../high-low/high-low.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  providers: [GameService]
})
export class GameComponent implements OnInit {

  private deck: Array<Card>;
  public stacks: Array<Card>;

  constructor(private _gameService: GameService,
    private dialog: MatDialog) { }

  ngOnInit() {
    this.deck = this._gameService.createDeck();
    this.stacks = this._gameService.createStacks();
    
  }

  openDialog(card: Card) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.data = card;
    this.dialog.open(HighLowComponent, dialogConfig);

    const dialogRef = this.dialog.open(HighLowComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      data => console.log('Dialog result: ', data)
    );
  }

  clickedCard(card: Card) {
    this._gameService.clickedCard(card);
    // this.deck.splice(this.deck.indexOf(card), 1)

  }

}
