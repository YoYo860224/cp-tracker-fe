import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { UserService } from './user.service';
import { StorageMap } from '@ngx-pwa/local-storage';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
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
          // 沒有 token，允許進入登入頁面
          return of(true);
        }

        // 有 token，檢查用戶狀態
        return this.userService.getCurrentUser().pipe(
          map((_) => {
            // 用戶已登入，重定向到 dashboard
            this.router.navigate(['/user']).then();
            return false;
          }),
          catchError((error) => {
            // token 無效或過期，允許進入登入頁面
            return of(true);
          })
        );
      }),
      catchError((error) => {
        // 如果獲取 token 失敗，允許進入登入頁面
        return of(true);
      })
    );
  }
}
