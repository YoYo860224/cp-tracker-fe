import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
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
    const payload = { email, displayName, password, inviteCode };
    return this.http.post<User>(`${environment.apiUrl}/v1/user`, payload).pipe(
      tap(user => {
        if (user.token) this.setToken(user.token);
        this.userInfo$.next(user);
      })
    );
  }

  public login(email: string, password: string): Observable<User> {
    const payload = { email, password };
    return this.http.post<User>(`${environment.apiUrl}/v1/user/login`, payload).pipe(
      tap(user => {
        if (user.token) this.setToken(user.token);
        this.userInfo$.next(user);
      })
    );
  }

  public logout(): void {
    this.removeToken();
    this.userInfo$.next(null);
  }

  public getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/v1/user`).pipe(
      tap((user) => {
        this.userInfo$.next(user);
      })
    );
  }

  public updateUserInfo(displayName: string): Observable<User> {
    const payload = { displayName };
    return this.http.put<User>(`${environment.apiUrl}/v1/user`, payload).pipe(
      tap(user => {
        this.userInfo$.next(user);
      })
    );
  }

  public updatePassword(oldPassword: string, newPassword: string): Observable<User> {
    const payload = { oldPassword, newPassword };
    return this.http.put<User>(`${environment.apiUrl}/v1/user/password`, payload).pipe(
      tap(user => {
        this.userInfo$.next(user);
      })
    );
  }

  public walletLogin(walletAddress: string, message: string, signature: string): Observable<User> {
    const payload = { walletAddress, message, signature };
    return this.http.post<User>(`${environment.apiUrl}/v1/user/wallet/login`, payload).pipe(
      tap((user: User) => {
        if (user.token) this.setToken(user.token);
        this.userInfo$.next(user);
      })
    );
  }

  public linkWallet(walletAddress: string, message: string, signature: string): Observable<User> {
    const payload = { walletAddress, message, signature };
    return this.http.post<User>(`${environment.apiUrl}/v1/user/wallet/link`, payload).pipe(
      tap((user: User) => {
        if (user.token) this.setToken(user.token);
        this.userInfo$.next(user);
      })
    );
  }

  public unlinkWallet(): Observable<User> {
    return this.http.delete<User>(`${environment.apiUrl}/v1/user/wallet/link`).pipe(
      tap((user: User) => {
        this.userInfo$.next(user);
      })
    );
  }
}
