import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { UserService } from './user.service';
import { StorageMap } from '@ngx-pwa/local-storage';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router,
    private storageMap: StorageMap
  ) {
  }

  canActivate(): Observable<boolean> {
    return this.storageMap.get('jwt-token').pipe(
      switchMap((token) => {
        if (!token) {
          this.router.navigate(['/login']).then();
          return of(false);
        }

        return this.userService.getCurrentUser().pipe(
          map((_) => {
            return true;
          }),
          catchError((error) => {
            this.router.navigate(['/login']).then();
            return of(false);
          })
        );
      }),
      catchError((error) => {
        // 如果获取 token 失败，跳转到登录页
        this.router.navigate(['/login']).then();
        return of(false);
      })
    );
  }
}
