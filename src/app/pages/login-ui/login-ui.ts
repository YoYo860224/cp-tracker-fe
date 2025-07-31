import { ChangeDetectorRef, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export type LoginFormControls = {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
};

export type RegisterFormControls = {
  email: FormControl<string | null>;
  username: FormControl<string | null>;
  password: FormControl<string | null>;
  confirmPassword: FormControl<string | null>;
  invite_code: FormControl<string | null>;
};

@Component({
  selector: 'app-login-ui',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './login-ui.html',
  styleUrl: './login-ui.scss'
})
export class LoginUi {
  // Interactive data
  loginForm: FormGroup<LoginFormControls>;
  registerForm: FormGroup<RegisterFormControls>;

  // UI
  loginError: string = '';
  registerError: string = '';
  isLoginLoading: boolean = false;
  isRegisterLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private userService: UserService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, this.confirmPasswordValidator.bind(this)]],
      invite_code: ['', [Validators.required]]
    });
  }

  // 確認密碼驗證器 - 設置在 confirmPassword 控件上
  private confirmPasswordValidator(control: FormControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const password = this.registerForm.value.password;
    if (!password) {
      return null;
    }

    return control.value === password ? null : {passwordMismatch: true};
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoginLoading = true;
      this.loginError = '';

      const {email, password} = this.loginForm.value;

      this.userService.login(email!, password!).subscribe({
        next: (res) => {
          this.isLoginLoading = false;
          this.router.navigate(['/user']).then();
        },
        error: (err) => {
          this.isLoginLoading = false;

          // 根據不同的錯誤狀態碼設置錯誤訊息
          if (err.status === 401) {
            this.loginError = '帳號或密碼錯誤，請重新輸入';
          } else if (err.status === 404) {
            this.loginError = '帳號不存在，請檢查電子郵件地址';
          } else if (err.status === 429) {
            this.loginError = '登入嘗試次數過多，請稍後再試';
          } else if (err.status === 0) {
            this.loginError = '網路連線錯誤，請檢查網路狀態';
          } else {
            this.loginError = err.error?.message || '登入失敗，請稍後再試';
          }


          this.cdr.detectChanges();
        }
      });
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.isRegisterLoading = true;
      this.registerError = '';

      const {email, username, password, invite_code} = this.registerForm.value;

      this.userService.register(email!, username!, password!, invite_code!).subscribe({
        next: (res) => {
          this.isRegisterLoading = false;
          this.router.navigate(['/user']).then();
        },
        error: (err) => {
          this.isRegisterLoading = false;

          // 根據不同的錯誤狀態碼設置錯誤訊息
          if (err.status === 400) {
            if (err.error?.message?.includes('email')) {
              this.registerError = '此電子郵件地址已被使用';
            } else if (err.error?.message?.includes('username')) {
              this.registerError = '此使用者名稱已被使用';
            } else {
              this.registerError = '註冊資料有誤，請檢查後重新輸入';
            }
          } else if (err.status === 403) {
            this.registerError = '邀請碼無效或已過期';
          } else if (err.status === 429) {
            this.registerError = '註冊嘗試次數過多，請稍後再試';
          } else if (err.status === 0) {
            this.registerError = '網路連線錯誤，請檢查網路狀態';
          } else {
            this.registerError = err.error?.message || '註冊失敗，請稍後再試';
          }

          this.cdr.detectChanges();
        }
      });
    } else {
      this.markFormGroupTouched(this.registerForm);
    }
  }

  clearLoginError() {
    this.loginError = '';
  }

  clearRegisterError() {
    this.registerError = '';
  }

  // 標記表單所有欄位為已觸摸，以顯示驗證錯誤
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  onPasskeyLogin() {
    this.snackBar.open('此功能尚未實作，敬請期待！', '關閉', {duration: 3000});
  }
}
