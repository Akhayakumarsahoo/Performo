
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import CashTransaction from '@/models/CashTransaction';
import Outlet from '@/models/Outlet';

export async function POST(req: Request, { params }: { params: { transactionId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const transaction = await CashTransaction.findById(params.transactionId);
  if (!transaction) {
    return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
  }

  transaction.approved = true;
  transaction.approvedBy = session.user.id;
  await transaction.save();

  // Update outlet's cashInHand
  const outlet = await Outlet.findById(transaction.outletId);
  if (outlet) {
    if (transaction.type === 'expense' || transaction.type === 'withdrawal') {
      outlet.cashInHand -= transaction.amount;
    }
    await outlet.save();
  }

  return NextResponse.json({ message: 'Transaction approved' });
}
