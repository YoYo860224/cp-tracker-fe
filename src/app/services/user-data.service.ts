import { Injectable } from '@angular/core';
import { Item } from '../../models/items';
import { BehaviorSubject, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { StorageMap } from '@ngx-pwa/local-storage';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { tap } from 'rxjs/operators';
import { UserData } from '../../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  public items$ = new ReplaySubject<{ [key: string]: Item }>(1);
  private items: { [key: string]: Item } = {};

  constructor(
    private storageMap: StorageMap,
    private http: HttpClient
  ) {
    this.loadData();
  }

  public loadData() {

    console.log('loadData');
    this.storageMap.get('items').subscribe({
      next: (data: any) => {
        if (data) {
          this.items = data;
        } else {
          this.items = this.mockData();
        }
        this.saveData();
      },
      error: () => {
        this.items = this.mockData();
        this.saveData();
      }
    });
  }

  public saveData() {
    for (let itemsKey in this.items) {
      let item = this.items[itemsKey];
      item.bestPrice = undefined;
      item.bestBrand = undefined;
      if (item.records.length > 0) {
        const validHistory = item.records.filter(h => !h.invalid);
        if (validHistory.length > 0) {
          const best = validHistory.reduce((prev, curr) => (prev.price < curr.price ? prev : curr));
          item.bestPrice = best.price / best.quantity * item.perUnit;
          item.bestBrand = best.brand;
        }
      }
    }

    this.storageMap.set('items', this.items).subscribe({
      next: () => {
        this.items$.next(this.items);
      }
    });
  }

  public createItem(item: Item) {
    if (item.id == '') {
      // 如果沒有 ID，則生成一個新的 UUID
      item.id = crypto.randomUUID();
      this.items[item.id] = item;
    } else {
      // 如果有 ID，則插入一條記錄到現有項目
      this.items[item.id].records.push(...item.records);
    }
    this.saveData();
    return item;
  }

  public updateItem(item: Item) {
    this.items[item.id] = item;
    this.saveData();
    return item;
  }

  public deleteItem(itemId: string) {
    delete this.items[itemId];
    this.saveData();
  }

  public getCloudData(): Observable<UserData> {
    return this.http.get<UserData>(environment.apiUrl + '/v1/user/data').pipe();
  }

  public syncCloud2Local(): Observable<UserData> {
    return this.http.get<UserData>(environment.apiUrl + '/v1/user/data').pipe(
      tap((cloudData) => {
        this.items = cloudData.items;
        this.saveData();

        this.items$.next(this.items);
      })
    );
  }

  public syncLocal2Cloud(): Observable<UserData> {
    return this.http.put<UserData>(environment.apiUrl + '/v1/user/data', this.items).pipe(
      tap((res) => {

      })
    );
  }

  public mockData(): { [key: string]: Item } {
    return {
      'sample-data': {
        id: 'sample-data',
        pined: true,
        name: '牛奶',
        unit: 'ml',
        perUnit: 1000,
        bestPrice: 60,
        bestBrand: '光泉',
        records: [
          {brand: '光泉鮮乳', price: 175, quantity: 1857, date: new Date('2025-07-01'), note: '家樂福線上購', invalid: false},
          {brand: '豐力富鮮乳', price: 189, quantity: 3000, date: new Date('2025-07-01'), note: 'COSTCO 現場', invalid: false},
          {brand: '全家林鳳營', price: 32, quantity: 936, date: new Date('2025-07-01'), note: '全家台新點數換購，限3罐', invalid: false}
        ]
      }
    };
  }
}
