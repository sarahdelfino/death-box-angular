import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../database.service';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent implements OnInit {
  players: string[] = [];
  seconds: number[] = [];
  id: string;
  currentPlayer: string;

  constructor(private db: DatabaseService,
    private route: ActivatedRoute
    ) { }

  ngOnInit() {
    this.getId();
    console.log(this.id);
    this.getPlayers();
    console.log(this.currentPlayer);
    // this.db.setCurrentPlayer(this.id, this.currentPlayer);
  }

  getId(): void {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  getPlayers() {
    this.db.getPlayers(this.id).valueChanges().subscribe(data => {
      console.log(data);
      for (let x in data) {
        console.log(data[x]);
        this.players.push(data[x]);
        // this.players.push(data[x].name)
        // this.seconds.push(data[x].seconds);
        console.log(this.players);
      }
    })

  }

  setCurrentPlayer(name: string) {
    this.db.setCurrentPlayer(this.id, name);
  }


}
