import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { UserDataService } from '../../services/user-data.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { User } from '../../../models/user';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export type UserInfoFormControls = {
  displayName: FormControl<string | null>;
};

export type PasswordFormControls = {
  oldPassword: FormControl<string | null>;
  newPassword: FormControl<string | null>;
  confirmPassword: FormControl<string | null>;
};

@Component({
  selector: 'app-user-ui',
  providers: [
    provideNativeDateAdapter()
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  templateUrl: './user-ui.html',
  styleUrl: './user-ui.scss'
})
export class UserUi implements OnInit {
  // Interactive data
  userInfoForm: FormGroup<UserInfoFormControls>;
  passwordForm: FormGroup<PasswordFormControls>;

  // UI
  isUserInfoLoading = false;
  userInfoError = '';
  isPasswordLoading = false;
  passwordError = '';
  isSyncLoading = false;
  syncError = '';

  // 用戶數據
  userInfo: User;
  cloudItemCount = 0;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private userDataService: UserDataService
  ) {
    this.userInfoForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(3)]]
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, this.confirmPasswordValidator.bind(this)]]
    });

    this.userInfo = this.userService.userInfo$.value!;
  }

  private confirmPasswordValidator(control: FormControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const password = this.passwordForm.value.newPassword;
    if (!password) {
      return null;
    }

    return control.value === password ? null : {passwordMismatch: true};
  }

  ngOnInit(): void {
    // 訂閱用戶信息
    this.userService.userInfo$.subscribe({
      next: (userInfo: User | null) => {
        if (userInfo) {
          this.userInfo = userInfo;
          this.userInfoForm.patchValue({
            displayName: userInfo.displayName || ''
          });
        } else {
          this.snackBar.open('無法獲取用戶信息，請重新登錄', '關閉', {
            duration: 3000,
          });
          this.router.navigate(['/login']).then();
        }
      }
    });

    // 取得雲端商品數量
    this.userDataService.getCloudData().subscribe({
      next: (cloudData) => {
        this.cloudItemCount = Object.keys(cloudData.items).length;
        this.cdr.detectChanges();
      }
    });
  }

  logout() {
    this.userService.logout();
    this.snackBar.open('已成功登出', '關閉', {
      duration: 3000,
    });
    this.router.navigate(['/login']).then();
  }

  updateDisplayName() {
    this.isUserInfoLoading = true;
    this.userInfoError = '';
    this.userService.updateUserInfo(this.userInfoForm.value.displayName!).subscribe({
      next: () => {
        this.isUserInfoLoading = false;
        this.snackBar.open('顯示名稱更新成功', '關閉', {
          duration: 3000,
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 400) {
          this.userInfoError = '顯示名稱已存在，請使用其他名稱';
          this.userInfoForm.controls.displayName.setErrors({incorrect: true});
        } else {
          this.userInfoError = '顯示名稱更新失敗，請稍後再試';
        }
        this.cdr.detectChanges();
      }
    });
  }

  updatePassword() {
    this.isPasswordLoading = true;
    this.passwordError = '';
    this.userService.updatePassword(this.passwordForm.value.oldPassword!, this.passwordForm.value.newPassword!).subscribe({
      next: () => {
        this.isPasswordLoading = false;
        this.snackBar.open('密碼更新成功', '關閉', {
          duration: 3000,
        });

        Object.keys(this.passwordForm.controls).forEach(key => {
          this.passwordForm.get(key)?.setErrors(null);
          this.passwordForm.get(key)?.markAsUntouched();
          this.passwordForm.get(key)?.markAsPristine();
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isPasswordLoading = false;

        if (err.status === 401) {
          this.passwordError = '舊密碼不正確，請重新輸入';
          this.passwordForm.controls.oldPassword.setErrors({incorrect: true});
        } else {
          this.passwordError = '密碼更新失敗，請稍後再試';
        }
        this.cdr.detectChanges();
      }
    });
  }

  syncCloud2Local() {
    this.isSyncLoading = true;
    this.syncError = '';

    this.userDataService.syncCloud2Local().subscribe({
      next: (userData) => {
        this.isSyncLoading = false;
        this.cloudItemCount = Object.keys(userData.items).length;
        this.snackBar.open('從雲端下載資料成功', '關閉', {
          duration: 3000,
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSyncLoading = false;
        this.syncError = '從雲端下載資料失敗，請稍後再試';
        this.snackBar.open('從雲端下載資料失敗', '關閉', {
          duration: 3000,
        });
        this.cdr.detectChanges();
      }
    });
  }

  syncLocal2Cloud() {
    this.isSyncLoading = true;
    this.syncError = '';

    this.userDataService.syncLocal2Cloud().subscribe({
      next: (userData) => {
        this.isSyncLoading = false;
        this.cloudItemCount = Object.keys(userData.items).length;
        this.snackBar.open('上傳資料到雲端成功', '關閉', {
          duration: 3000,
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSyncLoading = false;
        this.syncError = '上傳資料到雲端失敗，請稍後再試';
        this.snackBar.open('上傳資料到雲端失敗', '關閉', {
          duration: 3000,
        });
        this.cdr.detectChanges();
      }
    });
  }
}
