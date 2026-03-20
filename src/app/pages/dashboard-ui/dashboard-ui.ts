import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Item } from '../../../models/items';
import { UserDataService } from '../../services/user-data.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard-ui',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatTableModule,
    MatRippleModule,
    MatTooltipModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  templateUrl: './dashboard-ui.html',
  styleUrl: './dashboard-ui.scss'
})
export class DashboardUi implements OnInit, OnDestroy {
  // Interactive data
  protected searchText: string = '';
  private items: Item[] = [];

  // UI
  protected isLoading: boolean = true;
  private itemsSubscription?: Subscription;
  protected displayedItems: Item[] = [];
  protected displayedColumns: string[] = ['pined', 'name', 'bestBrand', 'bestPrice', 'actions'];
  private isMobile: boolean = false;

  constructor(
    private router: Router,
    private userDataService: UserDataService,
    private cdr: ChangeDetectorRef
  ) {

  }

  ngOnInit(): void {
    // 初始化響應式檢測
    this.checkScreenSize();

    // 訂閱用戶數據服務中的商品列表
    this.itemsSubscription = this.userDataService.items$.subscribe({
      next: (items) => {
        this.items = Object.values(items); // 儲存原始數據
        this.isLoading = false;
        this.filterItems();
        this.cdr.markForCheck(); // 確保在 zone 外的非同步更新能觸發變更偵測
      }
    });
  }

  ngOnDestroy(): void {
    this.itemsSubscription?.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?: Event): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    const newIsMobile = window.innerWidth < 600;
    if (this.isMobile !== newIsMobile) {
      this.isMobile = newIsMobile;
      if (this.isMobile) {
        this.displayedColumns = ['pined', 'itemInfo', 'actions'];
      } else {
        this.displayedColumns = ['pined', 'name', 'bestBrand', 'bestPrice', 'actions'];
      }
    }
  }

  /**
   * 根據搜尋文字過濾商品，並且將置頂的商品放在最前面
   */
  protected filterItems(): void {
    let filteredItems = this.items;

    // 如果有搜尋文字，則進行過濾
    if (this.searchText && this.searchText.trim()) {
      const searchTerm = this.searchText.trim().toLowerCase();
      filteredItems = this.items.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        (item.bestBrand && item.bestBrand.toLowerCase().includes(searchTerm)) ||
        item.records.some(history =>
          history.brand.toLowerCase().includes(searchTerm) ||
          (history.note && history.note.toLowerCase().includes(searchTerm))
        )
      );
    }

    // 排序：置頂商品在前，其他商品按名稱排序
    this.displayedItems = filteredItems.sort((a, b) => {
      // 置頂商品優先
      if (a.pined && !b.pined) return -1;
      if (!a.pined && b.pined) return 1;

      // 都置頂或都不置頂時，按名稱排序
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * 切換商品的置頂狀態
   * @param item 要切換置頂狀態的商品
   */
  protected togglePined(item: Item): void {
    item.pined = !item.pined;
    this.userDataService.updateItem(item);
  }

  protected checkItem(item: Item): void {
    this.router.navigate(['/item', item.id]).then();
  }

  protected newItem(): void {
    this.router.navigate(['/new-item']).then();
  }

  protected editItem(item: Item): void {
    this.router.navigate(['/edit-item', item.id]).then();
  }

  protected newRecordForItem(item: Item): void {
    this.router.navigate(['/new-record', item.id]).then();
  }
}
