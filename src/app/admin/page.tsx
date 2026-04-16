import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import AdminDashboard from './AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/admin/login');
  }

  if ((session.user as any).role !== 'ADMIN') {
    redirect('/membros');
  }

  return <AdminDashboard />;
}
