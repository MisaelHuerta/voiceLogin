import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Loading } from './Components/General/loading/loading';

@Component({
  selector: 'app-root',
  imports: [    
    RouterOutlet,
    Loading
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'voiceLogin';
}
