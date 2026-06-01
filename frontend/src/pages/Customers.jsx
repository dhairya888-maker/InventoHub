import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Building2, Mail, MapPin, Pencil, Phone, Search, Trash2, UserPlus, Users } from 'lucide-react';
import { customersApi, ordersApi } from '../api';
import Drawer from '../components/ui/Drawer';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useDebounce } from '../hooks/useDebounce';

function CustomerForm({ customer, onSubmit, isSubmitting }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: customer || { name: '', email: '', phone: '', address: '' },
  });

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <label className="block">
        <span className="mb-2 block text-sm font-bold" style={{ color: 'var(--text)' }}>Full name</span>
        <input className="field" {...register('name', { required: 'Name is required' })} />
        {errors.name && <p className="mt-2 text-xs font-bold text-red-500">{errors.name.message}</p>}
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-bold" style={{ color: 'var(--text)' }}>Email</span>
        <input className="field" type="email" {...register('email', { required: 'Email is required' })} />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-bold" style={{ color: 'var(--text)' }}>Phone</span>
        <input className="field" {...register('phone')} />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-bold" style={{ color: 'var(--text)' }}>Address</span>
        <textarea className="field min-h-28 resize-none" {...register('address')} />
      </label>
      <button className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : customer ? 'Update customer' : 'Create customer'}</button>
    </form>
  );
}

export default function Customers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailCustomer, setDetailCustomer] = useState(null);
  const [editCustomer, setEditCustomer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', { page, search: debouncedSearch }],
    queryFn: () => customersApi.list({ page, page_size: 10, search: debouncedSearch }),
    keepPreviousData: true,
  });

  const { data: orders } = useQuery({
    queryKey: ['orders', 'customerAnalytics'],
    queryFn: () => ordersApi.list({ page: 1, page_size: 100 }),
  });

  const orderCounts = useMemo(() => {
    const counts = new Map();
    (orders?.items || []).forEach((order) => {
      counts.set(order.customer_id, (counts.get(order.customer_id) || 0) + 1);
    });
    return counts;
  }, [orders]);

  const createMutation = useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDrawerOpen(false);
      toast.success('Customer created');
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: payload }) => customersApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setDrawerOpen(false);
      setEditCustomer(null);
      toast.success('Customer updated');
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: customersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Customer deleted');
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="premium-card p-5">
          <p className="eyebrow">Customer base</p>
          <p className="mt-3 text-3xl font-extrabold" style={{ color: 'var(--text)' }}>{data?.total || 0}</p>
          <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>Total active accounts</p>
        </div>
        <div className="premium-card p-5">
          <p className="eyebrow">Average orders</p>
          <p className="mt-3 text-3xl font-extrabold" style={{ color: 'var(--text)' }}>{data?.items?.length ? ((orders?.total || 0) / data.items.length).toFixed(1) : '0.0'}</p>
          <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>Per visible account</p>
        </div>
        <div className="premium-card p-5">
          <p className="eyebrow">Lifecycle</p>
          <p className="mt-3 text-3xl font-extrabold" style={{ color: 'var(--text)' }}>96%</p>
          <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>Profile completeness</p>
        </div>
      </section>

      <section className="glass-card p-4">
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: 'var(--line)', background: 'var(--panel-muted)' }}>
            <Search className="h-4 w-4" style={{ color: 'var(--soft)' }} />
            <input className="w-full bg-transparent text-sm font-semibold outline-none" style={{ color: 'var(--text)' }} placeholder="Search customer, email, or phone..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
          </div>
          <button className="btn-primary" onClick={() => { setEditCustomer(null); setDrawerOpen(true); }}>
            <UserPlus className="h-4 w-4" />
            New customer
          </button>
        </div>
      </section>

      <section className="glass-card overflow-hidden">
        {isLoading ? (
          <SkeletonLoader type="table" count={8} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState title="No customers found" message="Create a customer profile to track orders and customer health." icon={Users} />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-grid">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Order count</th>
                  <th>Customer health</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((customer, index) => (
                  <motion.tr key={customer.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.025 }}>
                    <td>
                      <button className="flex items-center gap-3 text-left" onClick={() => setDetailCustomer(customer)}>
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-sm font-extrabold text-white">
                          {customer.name.slice(0, 1).toUpperCase()}
                        </span>
                        <span>
                          <span className="block font-extrabold" style={{ color: 'var(--text)' }}>{customer.name}</span>
                          <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Enterprise account</span>
                        </span>
                      </button>
                    </td>
                    <td>
                      <div className="space-y-1 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                        <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{customer.email}</p>
                        <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{customer.phone || 'No phone'}</p>
                      </div>
                    </td>
                    <td><span className="badge">{orderCounts.get(customer.id) || 0} orders</span></td>
                    <td><span className="badge badge-success">Engaged</span></td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button className="icon-btn" onClick={() => { setEditCustomer(customer); setDrawerOpen(true); }}><Pencil className="h-4 w-4" /></button>
                        <button className="icon-btn text-red-500" onClick={() => setDeleteTarget(customer)}><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {data && <Pagination page={data.page} totalPages={data.total_pages} onPageChange={setPage} />}

      <Drawer isOpen={drawerOpen} onClose={() => { setDrawerOpen(false); setEditCustomer(null); }} title={editCustomer ? 'Edit customer' : 'Create customer'} eyebrow="Customer drawer">
        <CustomerForm
          customer={editCustomer}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onSubmit={(formData) => {
            if (editCustomer) updateMutation.mutate({ id: editCustomer.id, data: formData });
            else createMutation.mutate(formData);
          }}
        />
      </Drawer>

      <Drawer isOpen={!!detailCustomer} onClose={() => setDetailCustomer(null)} title={detailCustomer?.name || 'Customer'} eyebrow="Customer intelligence">
        {detailCustomer && (
          <div className="space-y-4">
            <div className="premium-card p-5">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="font-extrabold" style={{ color: 'var(--text)' }}>{detailCustomer.email}</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>{detailCustomer.phone || 'No phone on file'}</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border p-5" style={{ borderColor: 'var(--line)' }}>
              <p className="mb-2 flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--text)' }}><MapPin className="h-4 w-4" />Address</p>
              <p className="text-sm leading-6" style={{ color: 'var(--muted)' }}>{detailCustomer.address || 'No address provided.'}</p>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate(deleteTarget.id)} title="Delete customer" message={`Delete ${deleteTarget?.name}? This cannot be undone.`} />
    </div>
  );
}
