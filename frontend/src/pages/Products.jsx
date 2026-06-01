import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowDownUp, Boxes, CheckCircle2, Filter, PackagePlus, Pencil, Search, ShieldCheck, Trash2, TriangleAlert } from 'lucide-react';
import { productsApi } from '../api';
import Drawer from '../components/ui/Drawer';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useDebounce } from '../hooks/useDebounce';

function stockMeta(qty) {
  if (qty === 0) return { label: 'Out', className: 'badge-danger', icon: TriangleAlert, health: 'Critical' };
  if (qty <= 5) return { label: `${qty} left`, className: 'badge-danger', icon: TriangleAlert, health: 'Critical' };
  if (qty <= 10) return { label: `${qty} left`, className: 'badge-warning', icon: TriangleAlert, health: 'Watch' };
  return { label: `${qty} in stock`, className: 'badge-success', icon: CheckCircle2, health: 'Healthy' };
}

function ProductForm({ product, onSubmit, isSubmitting }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: product || { name: '', sku: '', description: '', price: '', stock_quantity: 0 },
  });

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-bold" style={{ color: 'var(--text)' }}>Product name</span>
          <input className="field" {...register('name', { required: 'Name is required' })} placeholder="Wireless scanner" />
          {errors.name && <p className="mt-2 text-xs font-bold text-red-500">{errors.name.message}</p>}
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold" style={{ color: 'var(--text)' }}>SKU</span>
          <input className="field" {...register('sku', { required: 'SKU is required' })} placeholder="INV-001" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold" style={{ color: 'var(--text)' }}>Price</span>
          <input className="field" type="number" step="0.01" {...register('price', { required: 'Price is required', valueAsNumber: true, min: 0.01 })} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold" style={{ color: 'var(--text)' }}>Stock</span>
          <input className="field" type="number" {...register('stock_quantity', { valueAsNumber: true, min: 0 })} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-bold" style={{ color: 'var(--text)' }}>Description</span>
          <textarea className="field min-h-28 resize-none" {...register('description')} placeholder="Operational notes, supplier context, or internal description." />
        </label>
      </div>
      <button className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : product ? 'Update product' : 'Create product'}</button>
    </form>
  );
}

export default function Products() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [healthFilter, setHealthFilter] = useState('all');
  const [selected, setSelected] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    if (new URLSearchParams(location.search).get('action') === 'create') {
      queueMicrotask(() => {
        setEditProduct(null);
        setDrawerOpen(true);
      });
      navigate('/products', { replace: true });
    }
  }, [location.search, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ['products', { page, search: debouncedSearch, sortBy, sortOrder }],
    queryFn: () => productsApi.list({ page, page_size: 10, search: debouncedSearch, sort_by: sortBy, sort_order: sortOrder }),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDrawerOpen(false);
      toast.success('Product created');
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: payload }) => productsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDrawerOpen(false);
      setEditProduct(null);
      toast.success('Product updated');
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Product deleted');
    },
    onError: (error) => toast.error(error.message),
  });

  const visibleItems = useMemo(() => {
    const items = data?.items || [];
    if (healthFilter === 'all') return items;
    return items.filter((product) => stockMeta(product.stock_quantity).health.toLowerCase() === healthFilter);
  }, [data, healthFilter]);

  const toggleSort = (field) => {
    setSortBy(field);
    setSortOrder((current) => (sortBy === field && current === 'asc' ? 'desc' : 'asc'));
  };

  const toggleSelected = (id) => {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  return (
    <div className="space-y-6">
      <section className="glass-card p-4">
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: 'var(--line)', background: 'var(--panel-muted)' }}>
            <Search className="h-4 w-4" style={{ color: 'var(--soft)' }} />
            <input className="w-full bg-transparent text-sm font-semibold outline-none" style={{ color: 'var(--text)' }} placeholder="Smart search by product, SKU, or description..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select className="field w-auto py-2.5" value={healthFilter} onChange={(event) => setHealthFilter(event.target.value)}>
              <option value="all">All health</option>
              <option value="healthy">Healthy</option>
              <option value="watch">Watch</option>
              <option value="critical">Critical</option>
            </select>
            <button className="btn-secondary">
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button className="btn-primary" onClick={() => { setEditProduct(null); setDrawerOpen(true); }}>
              <PackagePlus className="h-4 w-4" />
              New product
            </button>
          </div>
        </div>
        {selected.length > 0 && (
          <motion.div className="relative mt-4 flex items-center justify-between rounded-2xl border px-4 py-3" style={{ borderColor: 'var(--line)', background: 'color-mix(in srgb, var(--brand), transparent 90%)' }} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{selected.length} products selected</span>
            <button className="btn-ghost" onClick={() => setSelected([])}>Clear selection</button>
          </motion.div>
        )}
      </section>

      <section className="glass-card overflow-hidden">
        {isLoading ? (
          <SkeletonLoader type="table" count={8} />
        ) : visibleItems.length === 0 ? (
          <EmptyState title="No products match this view" message="Adjust search or filters, or create a new SKU for your inventory." icon={Boxes} action={<button className="btn-primary" onClick={() => setDrawerOpen(true)}>Create product</button>} />
        ) : (
          <div className="relative overflow-x-auto">
            <table className="data-grid">
              <thead>
                <tr>
                  <th><input type="checkbox" checked={selected.length === visibleItems.length} onChange={() => setSelected(selected.length === visibleItems.length ? [] : visibleItems.map((item) => item.id))} /></th>
                  <th><button className="inline-flex items-center gap-2" onClick={() => toggleSort('name')}>Product <ArrowDownUp className="h-3.5 w-3.5" /></button></th>
                  <th>SKU</th>
                  <th><button className="inline-flex items-center gap-2" onClick={() => toggleSort('price')}>Price <ArrowDownUp className="h-3.5 w-3.5" /></button></th>
                  <th>Stock health</th>
                  <th>Inventory status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((product, index) => {
                  const meta = stockMeta(product.stock_quantity);
                  return (
                    <motion.tr key={product.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.025 }}>
                      <td><input type="checkbox" checked={selected.includes(product.id)} onChange={() => toggleSelected(product.id)} /></td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500"><Boxes className="h-5 w-5" /></div>
                          <div>
                            <p className="font-extrabold">{product.name}</p>
                            <p className="max-w-xs truncate text-xs font-semibold" style={{ color: 'var(--muted)' }}>{product.description || 'No description'}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="font-mono text-xs font-bold" style={{ color: 'var(--muted)' }}>{product.sku}</span></td>
                      <td className="font-extrabold">${Number(product.price).toFixed(2)}</td>
                      <td><span className={`badge ${meta.className}`}><meta.icon className="h-3.5 w-3.5" />{meta.label}</span></td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-500/10">
                            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${Math.min(product.stock_quantity * 5, 100)}%` }} />
                          </div>
                          <span className="text-xs font-bold" style={{ color: 'var(--muted)' }}>{meta.health}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button className="icon-btn" onClick={() => { setEditProduct(product); setDrawerOpen(true); }}><Pencil className="h-4 w-4" /></button>
                          <button className="icon-btn text-red-500" onClick={() => setDeleteTarget(product)}><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {data && <Pagination page={data.page} totalPages={data.total_pages} onPageChange={setPage} />}

      <Drawer isOpen={drawerOpen} onClose={() => { setDrawerOpen(false); setEditProduct(null); }} title={editProduct ? 'Edit product' : 'Create product'} eyebrow="Inventory drawer">
        <div className="mb-6 rounded-3xl border p-4" style={{ borderColor: 'var(--line)', background: 'var(--panel-muted)' }}>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>Changes sync into dashboard health, revenue context, and order forms immediately.</p>
          </div>
        </div>
        <ProductForm
          product={editProduct}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onSubmit={(formData) => {
            if (editProduct) updateMutation.mutate({ id: editProduct.id, data: formData });
            else createMutation.mutate(formData);
          }}
        />
      </Drawer>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate(deleteTarget.id)} title="Delete product" message={`Delete ${deleteTarget?.name}? This cannot be undone.`} />
    </div>
  );
}
