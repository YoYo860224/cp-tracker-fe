import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { StorageMap } from '@ngx-pwa/local-storage';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private storageMap: StorageMap) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.storageMap.get('jwt-token').pipe(
      switchMap((token) => {
        if (token) {
          const authReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
          return next.handle(authReq);
        }
        return next.handle(req);
      })
    );
  }
}
