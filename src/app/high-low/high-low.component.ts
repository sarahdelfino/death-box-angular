import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { Card } from '../card/card';
import { DatabaseService } from '../database.service';
import { GameService } from '../game.service';

export interface CardData {
  imageId: string;
  state: "default" | "flipped";
}

@Component({
  selector: 'app-high-low',
  templateUrl: './high-low.component.html',
  styleUrls: ['./high-low.component.css'],
})

export class HighLowComponent implements OnInit, OnDestroy {

  @Input() public cardsInfo: any = []
  @Output() isFinished = new EventEmitter<boolean>();

  public card: Card;
  public choice: string;
  newCard: Card;
  data: CardData = {
    imageId: "",
    state: "default"
  };

  cardNum: string;
  title: string;
  stackLength: number;
  count: number;
  wrongGuess: boolean;
  text = '';
  gameId: string;
  subscription: Subscription;
  uiCounter: number;
  players: any = [];
  arrowClicked = false;
  cardSelected: boolean;
  hideImages = false;
  revealCount = false;
  imgPath: string;

  constructor(
    private gameService: GameService,
    private db: DatabaseService) {
  }

  ngOnInit() {
    this.card = this.cardsInfo.clickedCard;
    this.newCard = this.cardsInfo.newCard;
    this.stackLength = this.cardsInfo.stackLength;
    this.count = this.stackLength;
    this.gameId = this.cardsInfo.gameId;

    this.subscription = this.db.getGame(this.gameId).valueChanges().subscribe(g => {
      this.uiCounter = g.seconds;
      if (this.uiCounter == 1) {
        this.text = "second";
      } else {
        this.text = "seconds";
      }
      if (this.uiCounter == 0 && this.wrongGuess) {
        const timer = setTimeout(() => {
          console.log("ending high low...");
          this.isFinished.emit(this.wrongGuess);
        }, 1500);
      }
    });
  }

  ngAfterViewInit() {
    const selected = document.getElementById("selectedImg");
    selected.addEventListener("webkitanimationend", this.endCardMoveAnimation);
    selected.addEventListener("animationend", this.endCardMoveAnimation);
  }

  ngOnDestroy() {
    // end counting & delete seconds
    this.db.endCounting(this.gameId).then(() => {
      console.log("successfully ended counting!");
      this.subscription.unsubscribe();
    });
  }

  arrowClick(choice: string) {
    this.arrowClicked = true;
    this.cardsInfo['choice'] = choice;
    const compare = this.gameService.compare(choice, this.card.value, this.newCard.value);
    const seconds = 0;
    if (!compare) {
      this.wrongGuess = true;
      this.imgPath = '../../assets/drink.png';
      // this.db.updateCounting(this.gameId);
      this.count = this.stackLength;
      this.db.updateGameSecondsAndCounting(this.gameId, this.count).then(() => {
        console.log("successfully updated game seconds");
        this.title = 'Drink up!';
        const newSeconds = seconds + this.count;
        const timer = setTimeout(() => {
          this.revealCount = true;
          // this.db.setCounter(this.gameId, this.currentCounter);
        }, 1000);
      });
    } else {
      this.wrongGuess = false;
      this.imgPath = '../../assets/sober.png';
      this.title = "Correct!";
      const countTimer = setTimeout(() => {
        this.revealCount = true;
      }, 1000);
      const timer = setTimeout(() => {
        console.log("ending high low...");
        this.isFinished.emit(this.wrongGuess);
      }, 2000);
    }
  }

  endCardMoveAnimation() {
    this.revealCount = true;
  }

  finishedAnimations($event) {
    if ($event.fromState === 'void' && $event.triggerName === 'fadeViewOut') {
      // this.db.updateCounting(this.gameId);
      this.count = this.stackLength;
      this.db.updateGameSecondsAndCounting(this.gameId, this.count);
    }
  }

}
