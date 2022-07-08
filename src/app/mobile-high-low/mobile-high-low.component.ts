import { Component, Input, OnInit } from '@angular/core';
import { Card } from '../card/card';

export interface Test {
  state: "open" | "closed";
}

@Component({
  selector: 'app-mobile-high-low',
  templateUrl: './mobile-high-low.component.html',
  styleUrls: ['./mobile-high-low.component.css']
})
export class MobileHighLowComponent implements OnInit {

  @Input() card: Card;
  cardNum: string;

  constructor() { }

  ngOnInit(): void {
    console.log(this.card);
    this.cardNum = this.card[0].value;
    
  }

}
