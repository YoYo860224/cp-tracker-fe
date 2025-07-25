import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { UserDataService } from '../../services/user-data.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Item } from '../../../models/items';
import { ActivatedRoute, Router } from '@angular/router';


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
    {provide: MAT_DATE_LOCALE, useValue: 'zh-tw'},
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
  protected isEditMode = false;
  private itemId: string = '';

  // UI
  itemForm: FormGroup<ItemFormControls>;
  commonUnits: string[] = [
    'ml', 'g', '包', '份', '個', '瓶'
  ];

  constructor(private userDataService: UserDataService,
              private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private snackBar: MatSnackBar,
              private elementRef: ElementRef) {
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
    // 檢查路由參數以判斷是否為編輯模式
    this.route.params.subscribe(params => {
      if (params['id']) {
        // 有 ID 是編輯模式
        this.isEditMode = true;
        this.itemId = params['id'];
        this.loadItemForEdit(params['id']);
      } else {
        // 沒 ID 是新增模式
        this.isEditMode = false;
      }
    });
  }

  loadItemForEdit(itemId: string) {
    this.userDataService.items$.subscribe(itemsMap => {
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
        this.router.navigate(['/http/404'], {skipLocationChange: true}).then();
      }
    });
  }

  back() {
    history.back();
  }

  submitNewItem() {
    if (this.itemForm.valid) {
      const formData = this.itemForm.value;
      const newItem: Item = {
        id: this.isEditMode ? this.itemId! : '',
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
    } else {
      this.itemForm.markAllAsTouched();
    }
  }
}
