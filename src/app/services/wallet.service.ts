import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subscriber, map } from 'rxjs';
import { environment } from '../../environment/environment';

declare global {
  interface Window {
    ethereum?: any;
  }
}

@Injectable({ providedIn: 'root' })
export class WalletService {
  constructor(
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
  }

  public getWalletNonce(walletAddress: string): Observable<string> {
    return this.http.get<{ nonce: string }>(`${environment.apiUrl}/v1/user/wallet/nonce?walletAddress=${walletAddress}`).pipe(
      map(response => response.nonce)
    );
  }

  private isWalletAvailable(observer: Subscriber<any>): boolean {
    if (!window.ethereum) {
      this.snackBar.open('未檢測到 MetaMask 錢包，請安裝後重試', '安裝', { duration: 6000 })
        .onAction().subscribe(() => {
          window.open('https://metamask.io/download/', '_blank');
        });
      observer.error('未檢測到 MetaMask 錢包');
      return false;
    }
    return true;
  }

  public connectWallet(): Observable<string> {
    return new Observable<string>((observer) => {
      if (!this.isWalletAvailable(observer)) {
        return;
      }

      this.snackBar.open('正在連接錢包...', '關閉', { duration: 3000 });
      let ethRequest = {
        method: 'eth_requestAccounts'
      };
      window.ethereum.request(ethRequest)
        .then((accounts: string[]) => {
          observer.next(accounts[0]);
          observer.complete();
        })
        .catch(() => {
          this.snackBar.open('無法獲取錢包地址，請重試', '關閉', { duration: 3000 });
          observer.error('無法獲取錢包地址');
        });
    });
  }

  public signMessage(walletAddress: string, message: string): Observable<string> {
    return new Observable<string>((observer) => {
      if (!this.isWalletAvailable(observer)) {
        return;
      }

      this.snackBar.open('正在簽署訊息...', '關閉', { duration: 3000 });
      let ethRequest = {
        method: 'personal_sign',
        params: [message, walletAddress]
      };
      window.ethereum.request(ethRequest)
        .then((signature: string) => {
          observer.next(signature);
          observer.complete();
        })
        .catch(() => {
          this.snackBar.open('簽署失敗，請重試', '關閉', { duration: 3000 });
          observer.error('簽署失敗');
        });
    });
  }
}
