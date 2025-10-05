import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { GlobalUrl } from '../../Models/url.models';


@Injectable({
  providedIn: 'root'
})
export class Access {

  private url: string = GlobalUrl.URL;

  constructor(private http: HttpClient) {
  }

  public encryptUserName(data: any): Observable<any>{
    return this.http.post(this.url + 'api/encryptUserName/', data  );
  };

  public getRecords(): Observable<any>{
    return this.http.get(this.url + 'api/records'  );
  };
  
}
