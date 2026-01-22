import { Schema, model, models, Document } from 'mongoose';

export interface IOutlet extends Document {
  name: string;
  companyId: Schema.Types.ObjectId;
  cashInHand: number;
}

const OutletSchema = new Schema<IOutlet>(
  {
    name: { type: String, required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    cashInHand: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Outlet = models.Outlet || model<IOutlet>('Outlet', OutletSchema);

export default Outlet;
