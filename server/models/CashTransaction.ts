import { Schema, model, models, Document } from 'mongoose';

export interface ICashTransaction extends Document {
  date: Date;
  outletId: Schema.Types.ObjectId;
  companyId: Schema.Types.ObjectId;
  type: 'sales_cash' | 'expense' | 'withdrawal';
  amount: number;
  withdrawnBy?: Schema.Types.ObjectId;
  reason?: string;
  approved: boolean;
}

const CashTransactionSchema = new Schema<ICashTransaction>(
  {
    date: { type: Date, required: true },
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    type: {
      type: String,
      enum: ['sales_cash', 'expense', 'withdrawal'],
      required: true,
    },
    amount: { type: Number, required: true },
    withdrawnBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CashTransaction = models.CashTransaction || model<ICashTransaction>('CashTransaction', CashTransactionSchema);
