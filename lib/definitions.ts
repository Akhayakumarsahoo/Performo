import { Types } from "mongoose";

export interface IOutlet {
  _id: Types.ObjectId | string;
  name: string;
  companyId: Types.ObjectId | string;
  active: boolean;
}

export interface IDailySales {
  _id: Types.ObjectId | string;
  date: Date | string;
  outletId: Types.ObjectId | string;
  companyId: Types.ObjectId | string;
  totalSales: number;
  totalTransactions: number;
  approved: boolean;
}
