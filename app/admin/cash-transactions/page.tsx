'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { useAuthState } from '@/lib/useAuth';
import { ICashTransaction } from '@/lib/definitions';

const CashTransactionVerificationPage = () => {
  const { user } = useAuthState();
  const [transactions, setTransactions] = useState<ICashTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await apiClient.get('/admin/cash-transactions');
        setTransactions(response.data);
      } catch (error) {
        console.error('Error fetching cash transactions:', error);
      }
      setLoading(false);
    };

    if (user?.role === 'admin' || user?.role === 'manager') {
      fetchTransactions();
    }
  }, [user]);

  const handleApprove = async (transactionId: string) => {
    try {
      await apiClient.post(`/admin/cash-transactions/${transactionId}/approve`);
      setTransactions(transactions.filter((t) => t._id !== transactionId));
    } catch (error) {
      console.error('Error approving transaction:', error);
    }
  };

  const handleReject = async (transactionId: string) => {
    if (!rejectionReason) {
      alert('Please provide a reason for rejection.');
      return;
    }
    try {
      await apiClient.post(`/admin/cash-transactions/${transactionId}/reject`, { rejectionReason });
      setTransactions(transactions.filter((t) => t._id !== transactionId));
    } catch (error) {
      console.error('Error rejecting transaction:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return <div>You are not authorized to view this page.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cash Transaction Verification</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Outlet</th>
              <th className="py-2 px-4 border-b">Type</th>
              <th className="py-2 px-4 border-b">Amount</th>
              <th className="py-2 px-4 border-b">Reason</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t._id}>
                <td className="py-2 px-4 border-b">{new Date(t.date).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b">{t.outletId}</td>
                <td className="py-2 px-4 border-b">{t.type}</td>
                <td className="py-2 px-4 border-b">{t.amount}</td>
                <td className="py-2 px-4 border-b">{t.reason}</td>
                <td className="py-2 px-4 border-b">
                  <button onClick={() => handleApprove(t._id.toString())} className="bg-green-500 text-white px-2 py-1 rounded-md mr-2">Approve</button>
                  <input type="text" placeholder="Rejection Reason" onChange={(e) => setRejectionReason(e.target.value)} className="border rounded-md px-2 py-1 mr-2" />
                  <button onClick={() => handleReject(t._id.toString())} className="bg-red-500 text-white px-2 py-1 rounded-md">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashTransactionVerificationPage;
