import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { Item } from '../../../models/items';
import { UserDataService } from '../../services/user-data.service';

export enum ItemEditorMode {
  NEW_ITEM = 'new_item',                 // 新增商品 (new-item)
  EDIT_ITEM = 'edit_item',               // 編輯商品 (edit-item/:id)
  NEW_RECORD = 'new_record',             // 新增歷史紀錄 (new-record/:itemId)
  EDIT_RECORD = 'edit_record'            // 編輯現有歷史紀錄 (edit-record/:itemId/:recordIndex)
}

export type ItemFormControls = {
  name: FormControl<string | null>;
  unit: FormControl<string | null>;
  perUnit: FormControl<number | null>;
  brand: FormControl<string | null>;
  price: FormControl<number | null>;
  quantity: FormControl<number | null>;
  date: FormControl<Date | null>;
  note: FormControl<string | null>;
};

@Component({
  selector: 'app-item-editor-ui',
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'zh-tw' },
  ], imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatTableModule,
    MatTooltipModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatSnackBarModule,
    ReactiveFormsModule
  ],
  templateUrl: './item-editor-ui.html',
  styleUrl: './item-editor-ui.scss'
})
export class ItemEditorUi implements OnInit {
  // Interactive data
  protected mode = ItemEditorMode.NEW_ITEM;
  private itemId: string = '';
  private recordIndex: number = -1;

  // UI
  itemForm: FormGroup<ItemFormControls>;
  commonUnits: string[] = [
    'ml', 'g', '包', '份', '個', '瓶'
  ];

  constructor(
    private userDataService: UserDataService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private elementRef: ElementRef
  ) {
    this.itemForm = this.formBuilder.group({
      name: ['', Validators.required],
      unit: ['個', Validators.required],
      perUnit: [1, [Validators.required, Validators.min(0.1)]],
      brand: ['', Validators.required],
      price: [10, [Validators.required, Validators.min(0)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      date: [new Date()],
      note: ['']
    });
  }

  ngOnInit() {
    // 根據路由判斷模式
    const url = this.router.url;

    this.route.params.subscribe(params => {
      if (url.includes('new-item')) {
        // new-item
        this.mode = ItemEditorMode.NEW_ITEM;
      } else if (url.includes('edit-item')) {
        // edit-item/:id
        this.mode = ItemEditorMode.EDIT_ITEM;
        this.itemId = params['id'];
        this.load4EditItem(this.itemId);
        // 在編輯商品模式下，移除價格相關欄位的必填驗證
        this.itemForm.get('brand')?.clearValidators();
        this.itemForm.get('price')?.clearValidators();
        this.itemForm.get('quantity')?.clearValidators();
        this.itemForm.get('brand')?.updateValueAndValidity();
        this.itemForm.get('price')?.updateValueAndValidity();
        this.itemForm.get('quantity')?.updateValueAndValidity();
      } else if (url.includes('new-record')) {
        // new-record/:itemId
        this.mode = ItemEditorMode.NEW_RECORD;
        this.itemId = params['itemId'];
        this.load4NewRecord(this.itemId);
      } else if (url.includes('edit-record')) {
        // edit-record/:itemId/:recordIndex
        this.mode = ItemEditorMode.EDIT_RECORD;
        this.itemId = params['itemId'];
        this.recordIndex = parseInt(params['recordIndex']);
        this.load4EditRecord(this.itemId, this.recordIndex);
      }
    });
  }

  load4EditItem(itemId: string) {
    this.userDataService.items$.pipe(take(1)).subscribe(itemsMap => {
      let editingItem = itemsMap[itemId] || null;
      if (editingItem) {
        // 編輯商品模式：只填入商品基本資訊，不填入價格歷史記錄欄位
        this.itemForm.patchValue({
          name: editingItem.name,
          unit: editingItem.unit,
          perUnit: editingItem.perUnit,
          brand: '',        // 廠牌留空
          price: 10,        // 價格設為預設值
          quantity: 1,      // 數量設為預設值
          date: new Date(), // 日期設為今天
          note: ''          // 備註留空
        });
      } else {
        this.router.navigate(['/http/404'], { skipLocationChange: true }).then();
      }
    });
  }

  load4NewRecord(itemId: string) {
    this.userDataService.items$.pipe(take(1)).subscribe(itemsMap => {
      let editingItem = itemsMap[itemId] || null;
      if (editingItem) {
        // 填入商品基本資訊，但保持價格歷史紀錄欄位為空
        this.itemForm.patchValue({
          name: editingItem.name,
          unit: editingItem.unit,
          perUnit: editingItem.perUnit,
          brand: '',        // 廠牌留空
          price: 10,        // 價格設為預設值
          quantity: 1,      // 數量設為預設值
          date: new Date(), // 日期設為今天
          note: ''          // 備註留空
        });
      } else {
        this.router.navigate(['/http/404'], { skipLocationChange: true }).then();
      }
    });
  }

  load4EditRecord(itemId: string, recordIndex: number) {
    this.userDataService.items$.pipe(take(1)).subscribe(itemsMap => {
      let editingItem = itemsMap[itemId] || null;
      if (editingItem && editingItem.records[recordIndex]) {
        const record = editingItem.records[recordIndex];
        // 填入商品基本資訊和現有歷史記錄資訊
        this.itemForm.patchValue({
          name: editingItem.name,
          unit: editingItem.unit,
          perUnit: editingItem.perUnit,
          brand: record.brand,
          price: record.price,
          quantity: record.quantity,
          date: new Date(record.date),
          note: record.note || ''
        });
      } else {
        this.router.navigate(['/http/404'], { skipLocationChange: true }).then();
      }
    });
  }

  back() {
    history.back();
  }

  submit() {
    if (this.itemForm.valid) {
      const formData = this.itemForm.value;

      if (this.mode === ItemEditorMode.EDIT_ITEM) {
        // 編輯商品模式
        this.userDataService.items$.pipe(take(1)).subscribe(itemsMap => {
          const item = itemsMap[this.itemId];
          if (item) {
            // 更新商品基本資訊
            item.name = formData.name || '';
            item.perUnit = formData.perUnit || 1;
            item.unit = formData.unit || '';

            this.userDataService.updateItem(item);
            this.snackBar.open('修改成功！', '確定', { duration: 3000 });
            this.router.navigate(['/item', this.itemId]).then();
          }
        });
      } else if (this.mode === ItemEditorMode.EDIT_RECORD) {
        // 編輯現有歷史記錄模式
        this.userDataService.items$.pipe(take(1)).subscribe(itemsMap => {
          const item = itemsMap[this.itemId];
          if (item && item.records[this.recordIndex]) {
            // 更新指定的歷史記錄
            item.records[this.recordIndex] = {
              brand: formData.brand || '',
              price: formData.price || 0,
              quantity: formData.quantity || 1,
              date: formData.date || new Date(),
              note: formData.note || '',
              invalid: item.records[this.recordIndex].invalid
            };

            this.userDataService.updateItem(item);
            this.snackBar.open('修改成功！', '確定', { duration: 3000 });
            this.router.navigate(['/item', this.itemId]).then();
          }
        });
      } else {
        // 新增商品或新增歷史記錄模式
        const newItem: Item = {
          id: this.mode === ItemEditorMode.NEW_ITEM ? '' : this.itemId!,
          pined: false,
          name: formData.name || '',
          perUnit: formData.perUnit || 1,
          unit: formData.unit || '',
          records: [
            {
              brand: formData.brand || '',
              price: formData.price || 0,
              quantity: formData.quantity || 1,
              date: formData.date || new Date(),
              note: formData.note || '',
              invalid: false
            }
          ]
        };

        const createdItem = this.userDataService.createItem(newItem);
        this.snackBar.open('增加成功！', '確定', { duration: 3000 });
        this.router.navigate(['/item', createdItem.id]).then();
      }
    } else {
      this.itemForm.markAllAsTouched();
    }
  }

  // 便利方法用於模板中檢查模式
  get isEditMode(): boolean {
    return this.mode === ItemEditorMode.NEW_RECORD;
  }

  get isEditRecordMode(): boolean {
    return this.mode === ItemEditorMode.EDIT_RECORD;
  }

  get isCreateMode(): boolean {
    return this.mode === ItemEditorMode.NEW_ITEM;
  }

  get isEditItemMode(): boolean {
    return this.mode === ItemEditorMode.EDIT_ITEM;
  }
}
