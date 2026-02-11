import { Component, HostListener } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  imports: [
    RouterLink,
    RouterOutlet,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected navItem = [
    {
      name: 'Dashboard',
      route: '/dashboard',
      icon: 'dashboard'
    },
    {
      name: 'User',
      route: '/user',
      icon: 'person'
    },
  ];

  // PWA 安裝相關屬性
  private deferredPrompt: any = null;

  /**
   * 檢查是否處於 PWA 模式
   * 透過檢查 display-mode 來判斷
   */
  protected get isPwaInstalled(): boolean {
    return this.isPWA();
  }

  /**
   * 判斷是否處在 PWA 當中
   */
  private isPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches ||
           window.matchMedia('(display-mode: minimal-ui)').matches;
  }

  /**
   * 監聽 beforeinstallprompt 事件
   */
  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(event: Event): void {
    // 阻擋預設提示
    event.preventDefault();

    // 保存事件引用
    this.deferredPrompt = event;
  }

  showInstallPrompt(): void {
    if (this.deferredPrompt) {
      // 顯示安裝提示
      this.deferredPrompt.prompt();
    }
  }
}
