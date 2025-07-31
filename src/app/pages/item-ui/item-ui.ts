import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDataService } from '../../services/user-data.service';
import { Item, ItemPriceRecord } from '../../../models/items';
import { ConfirmDialog } from '../../dialogs/confirm-dialog/confirm-dialog';
import { take } from 'rxjs';

@Component({
  selector: 'app-item-ui', imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatSortModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './item-ui.html',
  styleUrl: './item-ui.scss'
})
export class ItemUi implements OnInit {
  // Interactive data
  protected item?: Item;
  protected itemId?: string;

  // UI
  protected displayedItemHistory: (ItemPriceRecord & { unitPrice: number, rank?: number })[] = [];
  protected displayedColumns: string[] = ['rank', 'brand', 'price', 'quantity', 'unitPrice', 'actions'];
  private isMobile: boolean = false;

  constructor(private dialog: MatDialog,
              private userDataService: UserDataService,
              private changeDetectorRef: ChangeDetectorRef,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    // 從路由參數獲取商品 ID
    this.itemId = this.route.snapshot.params['id']!;
    this.loadItem(this.itemId!);

    // 初始化響應式檢測
    this.checkScreenSize();

    // 訂閱用戶數據服務中的商品列表
    this.userDataService.items$.subscribe({
      next: (items) => {
        this.item = items[this.itemId!];
      }
    });
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
        this.displayedColumns = ['rank', 'recordInfo', 'actions'];
      } else {
        this.displayedColumns = ['rank', 'brand', 'price', 'quantity', 'unitPrice', 'actions'];
      }
    }
  }

  /**
   * 根據 ID 載入商品資料
   */
  private loadItem(itemId: string): void {
    this.userDataService.items$.pipe(take(1)).subscribe(items => {
      this.item = items[itemId];
      if (this.item) {
        this.sortingHistory();
      } else {
        // 找不到商品，導航到404頁面但不改變URL
        this.router.navigate(['/http/404'], {skipLocationChange: true}).then();
      }
    });
  }

  back() {
    this.router.navigate(['/dashboard']).then();
  }

  /**
   * 根據單價計算並排序歷史數據
   * - 計算每個歷史項目的單價
   * - 按單價排序
   * - rank 為單價名次
   * - 將無效項目添加到末尾
   */
  sortingHistory() {
    // 先計算單價
    this.displayedItemHistory = this.item!.records.map((historyItem, index) => {
      const unitPrice = +((historyItem.price / historyItem.quantity) * this.item!.perUnit).toFixed(1);
      return {...historyItem, unitPrice};
    });

    // 排序並且將無效項目放到最後
    this.displayedItemHistory.sort((a, b) => {
      if (a.invalid && !b.invalid) return 1; // 無效項目放到最後
      if (!a.invalid && b.invalid) return -1; // 有效項目排在前面
      return a.unitPrice - b.unitPrice; // 按單價排序
    });

    // 為每個項目分配排名
    this.displayedItemHistory.forEach((historyItem, index) => {
      historyItem.rank = index + 1;
      if (historyItem.invalid) {
        historyItem.rank = -1;
      }
    });

    // 強制更新顯示的歷史記錄列表
    this.changeDetectorRef.detectChanges();
  }

  /**
   * 新增一個歷史記錄項目
   * - 導航到編輯頁面
   */
  newRecord() {
    this.router.navigate(['/edit-item', this.itemId!]).then();
  }


  /**
   * 更新歷史記錄項目的有效性
   */
  updateRecordValid(historyItem: ItemPriceRecord) {
    historyItem.invalid = !historyItem.invalid;
    this.item!.records = this.displayedItemHistory;
    this.userDataService.updateItem(this.item!);
    this.sortingHistory();
  }

  /**
   * 移除歷史記錄
   */
  deleteRecord(historyItem: ItemPriceRecord) {
    if (!this.item) return;

    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: '刪除確認',
        message: `確定要刪除這筆歷史記錄嗎？`
      },
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // 從歷史記錄中移除該項目
        const index = this.item!.records.findIndex((item) => {
          return item.brand === historyItem.brand &&
            item.price === historyItem.price &&
            item.quantity === historyItem.quantity &&
            item.date === historyItem.date &&
            item.note === historyItem.note;
        });
        if (index > -1) {
          this.item!.records.splice(index, 1);
          this.userDataService.updateItem(this.item!);
          this.sortingHistory();
        }
      }
    });
  }

  /**
   * 移除此項目
   */
  deleteItem() {
    if (!this.item) return;

    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: '刪除商品',
        message: `確定要刪除商品「${this.item.name}」嗎？這將刪除所有相關的歷史記錄。`
      },
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.item) {
        this.userDataService.deleteItem(this.item.id);
        this.router.navigate(['/dashboard']).then();
      }
    });
  }
}
