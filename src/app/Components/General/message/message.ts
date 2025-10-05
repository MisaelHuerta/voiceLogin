import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-message',
  imports: [
    CommonModule,
    TranslateModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatRippleModule,
    MatDialogModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatSelectModule,
    MatCardModule,
  ],
  templateUrl: './message.html',
  styleUrl: './message.css'
})
export class Message {

  
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
  }

 ngOnInit() {
 }

}
