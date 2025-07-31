import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StorageMap } from '@ngx-pwa/local-storage';
import { environment } from '../../environment/environment';
import { User } from '../../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public userInfo$ = new BehaviorSubject<User | null>(null);

  constructor(
    private http: HttpClient,
    private storageMap: StorageMap
  ) {
  }

  private setToken(token: string): void {
    this.storageMap.set('jwt-token', token).subscribe({});
  }

  private removeToken(): void {
    this.storageMap.delete('jwt-token').subscribe({});
  }

  public register(email: string, displayName: string, password: string, inviteCode: string): Observable<User> {
    return this.http.post<User>(environment.apiUrl + '/v1/user', {
      email: email,
      displayName: displayName,
      password: password,
      inviteCode: inviteCode
    }).pipe(
      tap((user) => {
        if (user.token) {
          this.setToken(user.token);
        }
        this.userInfo$.next(user);
      })
    );
  }

  public login(email: string, password: string): Observable<User> {
    return this.http.post<User>(environment.apiUrl + '/v1/user/login', {email: email, password: password}).pipe(
      tap((user) => {
        if (user.token) {
          this.setToken(user.token);
        }
        this.userInfo$.next(user);
      })
    );
  }

  public logout(): void {
    this.removeToken();
    this.userInfo$.next(null);
  }

  public getCurrentUser(): Observable<User> {
    return this.http.get<User>(environment.apiUrl + '/v1/user').pipe(
      tap((user) => {
        this.userInfo$.next(user);
      })
    );
  }

  public updateUserInfo(displayName: string): Observable<User> {
    return this.http.put<User>(environment.apiUrl + '/v1/user', {displayName: displayName}).pipe(
      tap((user) => {
        this.userInfo$.next(user);
      })
    );
  }

  public updatePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.put<User>(environment.apiUrl + '/v1/user/password', {oldPassword: oldPassword, newPassword: newPassword}).pipe(
      tap((user) => {
        this.userInfo$.next(user);
      })
    );
  }
}
