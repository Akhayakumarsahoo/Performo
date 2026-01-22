'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOutletSalesSchema, CreateOutletSalesInput, CreateOutletSalesOutput } from '@/app/schemas/sales';
import apiClient from '@/lib/apiClient';
import { useRouter } from 'next/navigation';
import { useAuthState } from '@/lib/useAuth';

interface ManagementUser {
  id: string;
  name: string;
}

const OutletSalesEntryPage = () => {
  const router = useRouter();
  const { user } = useAuthState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [managementUsers, setManagementUsers] = useState<ManagementUser[]>([]);

  useEffect(() => {
    const fetchManagementUsers = async () => {
      try {
        const response = await apiClient.get('/users/management');
        setManagementUsers(response.data);
      } catch (err) {
        console.error('Failed to fetch management users', err);
      }
    };
    fetchManagementUsers();
  }, []);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateOutletSalesInput, undefined, CreateOutletSalesOutput>({
    resolver: zodResolver(createOutletSalesSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      totalSales: 0,
      billedPayments: {
        cash: 0,
        upi: 0,
        card: 0,
        online: { zomato: 0, swiggy: 0 },
      },
      actualPayments: {
        cash: 0,
        upi: 0,
        card: 0,
      },
      enteredByName: '',
      cashWithdrawal: 0,
      withdrawnBy: '',
      cashExpenses: 0,
      expenseReason: '',
    },
  });

  const cashExpenses = watch('cashExpenses');
  const cashWithdrawal = watch('cashWithdrawal');

  const onSubmit: SubmitHandler<CreateOutletSalesOutput> = async (data) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...data,
        outletId: user?.outletId,
      };
      await apiClient.post('/sales/outlet', payload);
      router.push('/outlet/dashboard');
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading user information...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-bold mb-6 text-slate-800">Daily Sales Entry</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <fieldset>
            <legend className="text-lg font-semibold text-slate-700 border-b w-full pb-2 mb-4">General Information</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-slate-600">Date</label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-200 focus:ring-opacity-50"
                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                    />
                  )}
                />
                {errors.date && <p className="text-red-600 text-xs mt-1">{errors.date.message}</p>}
              </div>
              <div>
                <label htmlFor="enteredByName" className="block text-sm font-medium text-slate-600">Your Name</label>
                <Controller
                  name="enteredByName"
                  control={control}
                  render={({ field }) => <input {...field} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-200 focus:ring-opacity-50" />}
                />
                {errors.enteredByName && <p className="text-red-600 text-xs mt-1">{errors.enteredByName.message}</p>}
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-lg font-semibold text-slate-700 border-b w-full pb-2 mb-4">Billed Payments (from System)</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="totalSales" className="block text-sm font-medium text-slate-600">Total Sales (System)</label>
                <Controller
                  name="totalSales"
                  control={control}
                  render={({ field }) => <input {...field} type="number" step="0.01" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-200 focus:ring-opacity-50" onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />}
                />
                {errors.totalSales && <p className="text-red-600 text-xs mt-1">{errors.totalSales.message}</p>}
              </div>
              <div>
                <label htmlFor="billedPayments.cash" className="block text-sm font-medium text-slate-600">Billed Cash</label>
                <Controller
                  name="billedPayments.cash"
                  control={control}
                  render={({ field }) => <input {...field} type="number" step="0.01" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-200 focus:ring-opacity-50" onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />}
                />
              </div>
              <div>
                <label htmlFor="billedPayments.upi" className="block text-sm font-medium text-slate-600">Billed UPI</label>
                <Controller
                  name="billedPayments.upi"
                  control={control}
                  render={({ field }) => <input {...field} type="number" step="0.01" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-200 focus:ring-opacity-50" onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />}
                />
              </div>
              <div>
                <label htmlFor="billedPayments.card" className="block text-sm font-medium text-slate-600">Billed Card</label>
                <Controller
                  name="billedPayments.card"
                  control={control}
                  render={({ field }) => <input {...field} type="number" step="0.01" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-200 focus:ring-opacity-50" onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />}
                />
              </div>
              <div>
                <label htmlFor="billedPayments.online.zomato" className="block text-sm font-medium text-slate-600">Billed Zomato</label>
                <Controller
                  name="billedPayments.online.zomato"
                  control={control}
                  render={({ field }) => <input {...field} type="number" step="0.01" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-200 focus:ring-opacity-50" onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />}
                />
              </div>
              <div>
                <label htmlFor="billedPayments.online.swiggy" className="block text-sm font-medium text-slate-600">Billed Swiggy</label>
                <Controller
                  name="billedPayments.online.swiggy"
                  control={control}
                  render={({ field }) => <input {...field} type="number" step="0.01" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-200 focus:ring-opacity-50" onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />}
                />
              </div>
            </div>
            {errors.billedPayments && <p className="text-red-600 text-xs mt-2">{errors.billedPayments.message}</p>}
          </fieldset>

          <fieldset>
            <legend className="text-lg font-semibold text-slate-700 border-b w-full pb-2 mb-4">Actual Payments (at Closing)</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                <label htmlFor="actualPayments.cash" className="block text-sm font-medium text-slate-600">Actual Cash Received</label>
                <Controller
                  name="actualPayments.cash"
                  control={control}
                  render={({ field }) => <input {...field} type="number" step="0.01" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-200 focus:ring-opacity-50" onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />}
                />
              </div>
              <div>
                <label htmlFor="actualPayments.upi" className="block text-sm font-medium text-slate-600">Actual UPI</label>
                <Controller
                  name="actualPayments.upi"
                  control={control}
                  render={({ field }) => <input {...field} type="number" step="0.01" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-200 focus:ring-opacity-50" onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />}
                />
              </div>
              <div>
                <label htmlFor="actualPayments.card" className="block text-sm font-medium text-slate-600">Actual Card</label>
                <Controller
                  name="actualPayments.card"
                  control={control}
                  render={({ field }) => <input {...field} type="number" step="0.01" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-200 focus:ring-opacity-50" onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />}
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-lg font-semibold text-slate-700 border-b w-full pb-2 mb-4">Cashbox Transactions</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cashWithdrawal" className="block text-sm font-medium text-slate-600">Cash Withdrawal</label>
                <Controller
                  name="cashWithdrawal"
                  control={control}
                  render={({ field }) => <input {...field} type="number" step="0.01" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-200 focus:ring-opacity-50" onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />}
                />
              </div>
              {cashWithdrawal > 0 && (
                <div>
                  <label htmlFor="withdrawnBy" className="block text-sm font-medium text-slate-600">Withdrawn By</label>
                  <Controller
                    name="withdrawnBy"
                    control={control}
                    render={({ field }) => (
                      <select {...field} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-200 focus:ring-opacity-50">
                        <option value="">Select User</option>
                        {managementUsers.map(user => (
                          <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                      </select>
                    )}
                  />
                </div>
              )}
              <div>
                <label htmlFor="cashExpenses" className="block text-sm font-medium text-slate-600">Cash Expenses</label>
                <Controller
                  name="cashExpenses"
                  control={control}
                  render={({ field }) => <input {...field} type="number" step="0.01" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-200 focus:ring-opacity-50" onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />}
                />
              </div>
              {cashExpenses > 0 && (
                <div className="md:col-span-2">
                  <label htmlFor="expenseReason" className="block text-sm font-medium text-slate-600">Reason for Expense</label>
                  <Controller
                    name="expenseReason"
                    control={control}
                    render={({ field }) => <input {...field} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-200 focus:ring-opacity-50" />}
                  />
                </div>
              )}
            </div>
          </fieldset>

          {error && <p className="text-red-600 text-center text-sm">{error}</p>}

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isSubmitting} className="w-full md:w-auto rounded-md bg-black px-6 py-2 font-semibold text-white hover:bg-gray-800 disabled:opacity-60">
              {isSubmitting ? 'Submitting...' : 'Submit Sales'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OutletSalesEntryPage;
