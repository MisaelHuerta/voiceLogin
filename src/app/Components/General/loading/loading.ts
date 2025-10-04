import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '../../../Interceptors/loading.service';
import { GlobalConstants } from '../../../Models/variables.models';

@Component({
  selector: 'app-loading',
  imports: [CommonModule],
  templateUrl: './loading.html',
  styleUrl: './loading.css'
})
export class Loading {

  public gif : string = GlobalConstants.gif;
  public isLoading$ : any
  constructor(private LoadingServ: LoadingService, public router: Router) {
    this.isLoading$ = this.LoadingServ.isLoading$;
  }

}
