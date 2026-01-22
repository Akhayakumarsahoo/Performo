'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import apiClient from '@/lib/apiClient';
import { useAuthState } from '@/lib/useAuth';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'manager', 'salesperson']),
  outletId: z.string().optional(),
});

type UserInput = z.infer<typeof userSchema>;

interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'salesperson';
  outletId?: string;
}

const UsersPage = () => {
  const { user } = useAuthState();
  const [users, setUsers] = useState<IUser[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserInput>({ resolver: zodResolver(userSchema) });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiClient.get('/admin/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const onSubmit: SubmitHandler<UserInput> = async (data) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiClient.post('/admin/users', data);
      reset();
      const response = await apiClient.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.role !== 'admin') {
    return <div>You are not authorized to view this page.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create User</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name">Name</label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <input {...field} className="w-full rounded-md border-gray-300" />}
              />
              {errors.name && <p className="text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => <input {...field} className="w-full rounded-md border-gray-300" />}
              />
              {errors.email && <p className="text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => <input {...field} type="password" className="w-full rounded-md border-gray-300" />}
              />
              {errors.password && <p className="text-red-500">{errors.password.message}</p>}
            </div>
            <div>
              <label htmlFor="role">Role</label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <select {...field} className="w-full rounded-md border-gray-300">
                    <option value="salesperson">Salesperson</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                )}
              />
            </div>
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="bg-black text-white px-4 py-2 rounded-md">
            {isSubmitting ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="py-2 px-4 border-b">{user.name}</td>
                  <td className="py-2 px-4 border-b">{user.email}</td>
                  <td className="py-2 px-4 border-b">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
