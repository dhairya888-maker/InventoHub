import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { CalendarClock, CheckCircle2, Clock3, Eye, PackageCheck, Plus, Search, ShoppingCart, Timer, Truck } from 'lucide-react';
import { customersApi, ordersApi, productsApi } from '../api';
import Drawer from '../components/ui/Drawer';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import SkeletonLoader from '../components/ui/SkeletonLoader';

const statusMeta = {
  pending: { className: 'badge-pending', icon: Clock3, label: 'Pending' },
  confirmed: { className: 'badge-info', icon: CheckCircle2, label: 'Confirmed' },
  shipped: { className: 'badge-warning', icon: Truck, label: 'Shipped' },
  delivered: { className: 'badge-success', icon: PackageCheck, label: 'Delivered' },
  cancelled: { className: 'badge-danger', icon: Timer, label: 'Cancelled' },
};

function CreateOrderForm({ onClose }) {
  const queryClient = useQueryClient();
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [step, setStep] = useState(1);

  const { data: customers } = useQuery({ queryKey: ['customers', 'all'], queryFn: () => customersApi.list({ page: 1, page_size: 100 }) });
  const { data: products } = useQuery({ queryKey: ['products', 'all'], queryFn: () => productsApi.list({ page: 1, page_size: 100 }) });

  const selectedProducts = items
    .filter((item) => item.product_id)
    .map((item) => {
      const product = products?.items.find((entry) => entry.id === item.product_id);
      return { ...item, product, subtotal: product ? Number(product.price) * item.quantity : 0 };
    });

  const total = selectedProducts.reduce((sum, item) => sum + item.subtotal, 0);

  const createMutation = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Order created and inventory updated');
      onClose();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateItem = (index, field, value) => {
    setItems((current) => {
      const next = [...current];
      next[index] = { ...next[index], [field]: field === 'quantity' ? Number(value) || 1 : value };
      return next;
    });
  };

  const canContinue = step === 1 ? customerId : step === 2 ? items.every((item) => item.product_id && item.quantity > 0) : true;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-2">
        {['Customer', 'Items', 'Review'].map((label, index) => (
          <div key={label} className={`rounded-2xl border px-3 py-2 text-center text-xs font-extrabold ${step >= index + 1 ? 'text-white' : ''}`} style={{ borderColor: 'var(--line)', background: step >= index + 1 ? 'linear-gradient(135deg, #635bff, #22d3ee)' : 'var(--panel-muted)', color: step >= index + 1 ? 'white' : 'var(--muted)' }}>
            {label}
          </div>
        ))}
      </div>

      {step === 1 && (
        <label className="block">
          <span className="mb-2 block text-sm font-bold" style={{ color: 'var(--text)' }}>Customer</span>
          <select className="field" value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
            <option value="">Choose customer...</option>
            {customers?.items.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} ({customer.email})</option>)}
          </select>
        </label>
      )}

      {step === 2 && (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="grid gap-3 rounded-3xl border p-3 sm:grid-cols-[1fr_96px_auto]" style={{ borderColor: 'var(--line)' }}>
              <select className="field" value={item.product_id} onChange={(event) => updateItem(index, 'product_id', event.target.value)}>
                <option value="">Select product...</option>
                {products?.items.map((product) => <option key={product.id} value={product.id}>{product.name} - ${Number(product.price).toFixed(2)} - Stock {product.stock_quantity}</option>)}
              </select>
              <input className="field" type="number" min="1" value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} />
              <button className="btn-secondary" type="button" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
            </div>
          ))}
          <button className="btn-secondary" type="button" onClick={() => setItems((current) => [...current, { product_id: '', quantity: 1 }])}>
            <Plus className="h-4 w-4" />
            Add line item
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          {selectedProducts.map((item) => (
            <div key={item.product_id} className="flex items-center justify-between rounded-3xl border p-4" style={{ borderColor: 'var(--line)' }}>
              <div>
                <p className="font-extrabold" style={{ color: 'var(--text)' }}>{item.product?.name}</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Quantity {item.quantity}</p>
              </div>
              <p className="font-extrabold" style={{ color: 'var(--text)' }}>${item.subtotal.toFixed(2)}</p>
            </div>
          ))}
          <div className="premium-card p-5">
            <p className="text-sm font-bold" style={{ color: 'var(--muted)' }}>Order total</p>
            <p className="mt-2 text-3xl font-extrabold" style={{ color: 'var(--text)' }}>${total.toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-5" style={{ borderColor: 'var(--line)' }}>
        <button className="btn-secondary" type="button" onClick={() => (step === 1 ? onClose() : setStep((current) => current - 1))}>
          {step === 1 ? 'Cancel' : 'Back'}
        </button>
        {step < 3 ? (
          <button className="btn-primary" type="button" disabled={!canContinue} onClick={() => setStep((current) => current + 1)}>Continue</button>
        ) : (
          <button className="btn-primary" type="button" disabled={createMutation.isPending} onClick={() => createMutation.mutate({ customer_id: customerId, items: items.map(({ product_id, quantity }) => ({ product_id, quantity })) })}>
            {createMutation.isPending ? 'Creating...' : 'Place order'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Orders() {
  const location = useLocation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState(null);

  useEffect(() => {
    if (new URLSearchParams(location.search).get('action') === 'create') {
      queueMicrotask(() => setCreateOpen(true));
      navigate('/orders', { replace: true });
    }
  }, [location.search, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', { page, status }],
    queryFn: () => ordersApi.list({ page, page_size: 10, ...(status && { status }) }),
    keepPreviousData: true,
  });

  const { data: detail } = useQuery({ queryKey: ['order', detailId], queryFn: () => ordersApi.get(detailId), enabled: Boolean(detailId) });

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return (data?.items || []).filter((order) => !query || order.customer_name?.toLowerCase().includes(query) || order.id.toLowerCase().includes(query));
  }, [data, search]);

  const revenue = (data?.items || []).reduce((sum, order) => sum + Number(order.total_amount), 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="premium-card p-5">
          <p className="eyebrow">Order volume</p>
          <p className="mt-3 text-3xl font-extrabold" style={{ color: 'var(--text)' }}>{data?.total || 0}</p>
          <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>Total orders tracked</p>
        </div>
        <div className="premium-card p-5">
          <p className="eyebrow">Visible revenue</p>
          <p className="mt-3 text-3xl font-extrabold" style={{ color: 'var(--text)' }}>${revenue.toFixed(2)}</p>
          <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>Current filtered page</p>
        </div>
        <div className="premium-card p-5">
          <p className="eyebrow">Fulfillment SLA</p>
          <p className="mt-3 text-3xl font-extrabold" style={{ color: 'var(--text)' }}>92%</p>
          <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>On-time movement</p>
        </div>
      </section>

      <section className="glass-card p-4">
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: 'var(--line)', background: 'var(--panel-muted)' }}>
            <Search className="h-4 w-4" style={{ color: 'var(--soft)' }} />
            <input className="w-full bg-transparent text-sm font-semibold outline-none" style={{ color: 'var(--text)' }} placeholder="Search order ID or customer..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <select className="field w-auto py-2.5" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            {Object.keys(statusMeta).map((item) => <option key={item} value={item}>{statusMeta[item].label}</option>)}
          </select>
          <button className="btn-primary" onClick={() => setCreateOpen(true)}>
            <ShoppingCart className="h-4 w-4" />
            New order
          </button>
        </div>
      </section>

      <section className="glass-card overflow-hidden">
        {isLoading ? (
          <SkeletonLoader type="table" count={8} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No orders found" message="Create a new order to start fulfillment tracking." icon={ShoppingCart} action={<button className="btn-primary" onClick={() => setCreateOpen(true)}>Create order</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-grid">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Timeline</th>
                  <th className="text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, index) => {
                  const meta = statusMeta[order.status] || statusMeta.pending;
                  return (
                    <motion.tr key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.025 }}>
                      <td><span className="font-mono text-xs font-extrabold" style={{ color: 'var(--muted)' }}>{order.id.slice(0, 8).toUpperCase()}</span></td>
                      <td className="font-extrabold">{order.customer_name || 'Customer'}</td>
                      <td className="font-extrabold">${Number(order.total_amount).toFixed(2)}</td>
                      <td><span className={`badge ${meta.className}`}><meta.icon className="h-3.5 w-3.5" />{meta.label}</span></td>
                      <td>
                        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                          <CalendarClock className="h-4 w-4" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td><div className="flex justify-end"><button className="icon-btn" onClick={() => setDetailId(order.id)}><Eye className="h-4 w-4" /></button></div></td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {data && <Pagination page={data.page} totalPages={data.total_pages} onPageChange={setPage} />}

      <Drawer isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create order" eyebrow="Guided order flow" width="max-w-2xl">
        <CreateOrderForm onClose={() => setCreateOpen(false)} />
      </Drawer>

      <Drawer isOpen={!!detailId} onClose={() => setDetailId(null)} title="Order details" eyebrow="Fulfillment timeline" width="max-w-2xl">
        {!detail ? (
          <SkeletonLoader type="table" count={3} />
        ) : (
          <div className="space-y-5">
            <div className="premium-card p-5">
              <p className="eyebrow">Order summary</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div><p className="text-xs font-bold" style={{ color: 'var(--muted)' }}>Customer</p><p className="mt-1 font-extrabold" style={{ color: 'var(--text)' }}>{detail.customer_name}</p></div>
                <div><p className="text-xs font-bold" style={{ color: 'var(--muted)' }}>Total</p><p className="mt-1 font-extrabold" style={{ color: 'var(--text)' }}>${Number(detail.total_amount).toFixed(2)}</p></div>
                <div><p className="text-xs font-bold" style={{ color: 'var(--muted)' }}>Status</p><p className="mt-1"><span className={`badge ${(statusMeta[detail.status] || statusMeta.pending).className}`}>{detail.status}</span></p></div>
              </div>
            </div>
            <div className="space-y-3">
              {detail.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-3xl border p-4" style={{ borderColor: 'var(--line)' }}>
                  <div>
                    <p className="font-extrabold" style={{ color: 'var(--text)' }}>{item.product_name || item.product_sku}</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Quantity {item.quantity} at ${Number(item.unit_price).toFixed(2)}</p>
                  </div>
                  <p className="font-extrabold" style={{ color: 'var(--text)' }}>${Number(item.subtotal).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
