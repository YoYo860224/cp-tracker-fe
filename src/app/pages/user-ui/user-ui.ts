import { Component } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-user-ui',
  providers: [
    provideNativeDateAdapter()
  ],
  imports: [],
  templateUrl: './user-ui.html',
  styleUrl: './user-ui.scss'
})
export class UserUi {

}
