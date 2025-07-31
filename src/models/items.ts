/** 商品 */
export interface Item {
  /** 商品 ID */
  id: string;
  /** 是否置頂 */
  pined: boolean;
  /** 商品名稱 */
  name: string;
  /** 商品單位，例如 'ml', 'kg', 'pcs' 等 */
  unit: string;
  /** 每單位的數量，例如以多少毫升作為單價 */
  perUnit: number;
  /** 最便宜的品牌 */
  bestBrand?: string;
  /** 最便宜的價格 */
  bestPrice?: number;
  /** 商品價格記錄 */
  records: ItemPriceRecord[];
}

/* 商品價格紀錄 */
export interface ItemPriceRecord {
  /** 品牌或品項名稱 */
  brand: string;
  /** 價格 */
  price: number;
  /** 數量 */
  quantity: number;
  /** 日期 */
  date: Date;
  /** 備註 */
  note?: string;
  /** 是否標註為無效 */
  invalid: boolean;
}

