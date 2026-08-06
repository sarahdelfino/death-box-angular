import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { SeoService } from './seo.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [RouterOutlet]
})
export class AppComponent {
  constructor(private readonly seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.initialize();
  }
}

