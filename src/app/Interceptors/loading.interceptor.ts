import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { finalize } from "rxjs/operators";
import { LoadingService } from "./loading.service";

@Injectable()
export class LoadingInterceptor implements HttpInterceptor{
    private totalRequests = 0;
    private completedRequests = 0;
    constructor(private LoadingServ: LoadingService) {}
  
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      this.LoadingServ.showLoading();
      this.totalRequests++;
      return next.handle(req).pipe(
        finalize(() => {
          this.completedRequests++;
  
          console.log(this.completedRequests, this.totalRequests);
  
          if (this.completedRequests === this.totalRequests) {
            this.LoadingServ.hideLoading();
            this.completedRequests = 0;
            this.totalRequests = 0;
          }
        })
      );
    }

}