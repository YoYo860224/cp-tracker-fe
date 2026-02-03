import { Component, OnInit, HostListener } from '@angular/core';
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
export class App implements OnInit {
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
  protected isPwaInstalled = false;
  private readonly PWA_INSTALLED_KEY = 'pwa-installed';

  ngOnInit(): void {
    // 檢查是否已安裝 PWA
    try {
      this.isPwaInstalled = localStorage.getItem(this.PWA_INSTALLED_KEY) === 'true';
    } catch (error) {
      // localStorage 可能在某些環境下不可用 (例如：隱私模式)
      this.isPwaInstalled = false;
    }
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

  /**
   * 監聽 appinstalled 事件
   */
  @HostListener('window:appinstalled')
  onAppInstalled(): void {
    // 標記為已安裝
    this.isPwaInstalled = true;
    try {
      localStorage.setItem(this.PWA_INSTALLED_KEY, 'true');
    } catch (error) {
      // localStorage 可能在某些環境下不可用 (例如：隱私模式)
      console.warn('Unable to save PWA installation state to localStorage', error);
    }
    this.deferredPrompt = null;
  }

  showInstallPrompt(): void {
    if (this.deferredPrompt) {
      // 顯示安裝提示
      this.deferredPrompt.prompt();
    }
  }
}
