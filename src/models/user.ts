import { Item } from './items';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  token: string;
}

export interface UserData {
  uid: string;
  items: { [key: string]: Item };
}
