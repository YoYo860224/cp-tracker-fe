import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-http-resp-ui',
  imports: [
    CommonModule,
    MatButtonModule
  ],
  templateUrl: './http-resp-ui.html',
  styleUrl: './http-resp-ui.scss'
})
export class HttpRespUi implements OnInit {
  errorCode: string = '';

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    // 從路由參數獲取錯誤代碼
    this.route.params.subscribe(params => {
      this.errorCode = params['code'] || '404';
    });
  }

  goBack() {
    history.back();
  }
}
