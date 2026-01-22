import { Types } from "mongoose";

export interface IOutlet {
  _id: Types.ObjectId | string;
  name: string;
  companyId: Types.ObjectId | string;
  active: boolean;
  cashInHand: number;
  monthlyTarget: number;
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

export interface ICashTransaction {
  _id: Types.ObjectId | string;
  date: Date | string;
  outletId: Types.ObjectId | string;
  companyId: Types.ObjectId | string;
  type: 'sales_cash' | 'expense' | 'withdrawal';
  amount: number;
  reason?: string;
  withdrawnBy?: Types.ObjectId | string;
  approved: boolean;
  approvedBy?: Types.ObjectId | string;
  rejectionReason?: string;
}
