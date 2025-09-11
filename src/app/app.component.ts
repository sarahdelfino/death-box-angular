import { Component } from '@angular/core';
import { GameService } from './game.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [GameService],
    standalone: false
})
export class AppComponent {

}

