import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { USER_ROLES } from '@/lib/roles';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const users = await User.find({
    companyId: session.user.companyId,
    role: { $in: [USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.MANAGER] },
  }).select('id name');

  return NextResponse.json(users);
}
