
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import CashTransaction from '@/models/CashTransaction';

export async function POST(req: Request, { params }: { params: { transactionId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { rejectionReason } = await req.json();

  await dbConnect();

  const transaction = await CashTransaction.findById(params.transactionId);
  if (!transaction) {
    return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
  }

  transaction.approved = false;
  transaction.rejectionReason = rejectionReason;
  await transaction.save();

  return NextResponse.json({ message: 'Transaction rejected' });
}
