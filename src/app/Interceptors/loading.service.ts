import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  isLoading$ = new Subject<boolean>();
  public timer = new BehaviorSubject(false);
  constructor() { }

  showLoading(): void{
    this.isLoading$.next(true);
    this.timer.next(true);
  }

  hideLoading(): void{
    this.isLoading$.next(false);
    this.timer.next(false);
  }
}