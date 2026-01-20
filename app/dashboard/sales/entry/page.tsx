
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOutletSalesSchema, CreateOutletSalesInput } from '@/server/schemas/sales';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

const SalesEntryPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateOutletSalesInput>({
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
        online: { zomato: 0, swiggy: 0 },
      },
      actualCashInBox: 0,
      enteredByName: '',
    },
  });

  const onSubmit = async (data: CreateOutletSalesInput) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post('/sales/outlet', data);
      router.push('/dashboard/sales'); // Redirect to a success or listing page
    } catch (err: any) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Watch totalSales to validate against billed payments sum
  const totalSales = watch('totalSales');

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Daily Sales Entry</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* General Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded">
          <h2 className="text-lg font-semibold md:col-span-3">General Information</h2>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <Controller
              name="date"
              control={control}
              render={({ field }) => <input {...field} type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />}
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
          </div>
          <div>
            <label htmlFor="enteredByName" className="block text-sm font-medium text-gray-700">Your Name</label>
            <Controller
              name="enteredByName"
              control={control}
              render={({ field }) => <input {...field} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />}
            />
            {errors.enteredByName && <p className="text-red-500 text-xs mt-1">{errors.enteredByName.message}</p>}
          </div>
        </div>

        {/* Billed Payments (As per Petpooja/Billing System) */}
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold">Billed Payments (from System)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div>
              <label htmlFor="totalSales" className="block text-sm font-medium text-gray-700">Total Sales (System)</label>
              <Controller
                name="totalSales"
                control={control}
                render={({ field }) => <input {...field} type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />}
              />
              {errors.totalSales && <p className="text-red-500 text-xs mt-1">{errors.totalSales.message}</p>}
            </div>
            <div>
              <label htmlFor="billedPayments.cash" className="block text-sm font-medium text-gray-700">Billed Cash</label>
              <Controller
                name="billedPayments.cash"
                control={control}
                render={({ field }) => <input {...field} type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />}
              />
            </div>
            <div>
              <label htmlFor="billedPayments.upi" className="block text-sm font-medium text-gray-700">Billed UPI</label>
              <Controller
                name="billedPayments.upi"
                control={control}
                render={({ field }) => <input {...field} type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />}
              />
            </div>
            <div>
              <label htmlFor="billedPayments.card" className="block text-sm font-medium text-gray-700">Billed Card</label>
              <Controller
                name="billedPayments.card"
                control={control}
                render={({ field }) => <input {...field} type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />}
              />
            </div>
            <div>
              <label htmlFor="billedPayments.online.zomato" className="block text-sm font-medium text-gray-700">Billed Zomato</label>
              <Controller
                name="billedPayments.online.zomato"
                control={control}
                render={({ field }) => <input {...field} type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />}
              />
            </div>
            <div>
              <label htmlFor="billedPayments.online.swiggy" className="block text-sm font-medium text-gray-700">Billed Swiggy</label>
              <Controller
                name="billedPayments.online.swiggy"
                control={control}
                render={({ field }) => <input {...field} type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />}
              />
            </div>
          </div>
          {errors.billedPayments && <p className="text-red-500 text-xs mt-2">{errors.billedPayments.message}</p>}
        </div>

        {/* Actual Payments (At Closing) */}
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold">Actual Payments (at Closing)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div>
              <label htmlFor="actualCashInBox" className="block text-sm font-medium text-gray-700">Actual Cash in Box</label>
              <Controller
                name="actualCashInBox"
                control={control}
                render={({ field }) => <input {...field} type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />}
              />
               {errors.actualCashInBox && <p className="text-red-500 text-xs mt-1">{errors.actualCashInBox.message}</p>}
            </div>
             <div>
              <label htmlFor="actualPayments.cash" className="block text-sm font-medium text-gray-700">Actual Cash Received</label>
              <Controller
                name="actualPayments.cash"
                control={control}
                render={({ field }) => <input {...field} type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />}
              />
            </div>
            <div>
              <label htmlFor="actualPayments.upi" className="block text-sm font-medium text-gray-700">Actual UPI</label>
              <Controller
                name="actualPayments.upi"
                control={control}
                render={({ field }) => <input {...field} type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />}
              />
            </div>
            <div>
              <label htmlFor="actualPayments.card" className="block text-sm font-medium text-gray-700">Actual Card</label>
              <Controller
                name="actualPayments.card"
                control={control}
                render={({ field }) => <input {...field} type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />}
              />
            </div>
            <div>
              <label htmlFor="actualPayments.online.zomato" className="block text-sm font-medium text-gray-700">Actual Zomato</label>
              <Controller
                name="actualPayments.online.zomato"
                control={control}
                render={({ field }) => <input {...field} type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />}
              />
            </div>
            <div>
              <label htmlFor="actualPayments.online.swiggy" className="block text-sm font-medium text-gray-700">Actual Swiggy</label>
              <Controller
                name="actualPayments.online.swiggy"
                control={control}
                render={({ field }) => <input {...field} type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />}
              />
            </div>
          </div>
        </div>


        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
            {isSubmitting ? 'Submitting...' : 'Submit Sales'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalesEntryPage;
