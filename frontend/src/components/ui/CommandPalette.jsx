import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Box, Command, LayoutDashboard, Plus, Search, ShoppingCart, Users, X } from 'lucide-react';

const actions = [
  { label: 'Open dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Manage products', path: '/products', icon: Box },
  { label: 'Add product', path: '/products?action=create', icon: Plus },
  { label: 'Manage customers', path: '/customers', icon: Users },
  { label: 'Create order', path: '/orders?action=create', icon: ShoppingCart },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filtered = useMemo(
    () => actions.filter((action) => action.label.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const runAction = (path) => {
    navigate(path);
    setOpen(false);
    setQuery('');
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center p-4 pt-[12vh]">
          <motion.div
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            className="glass-card relative w-full max-w-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
          >
            <div className="relative flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--line)' }}>
              <Command className="h-5 w-5" style={{ color: 'var(--brand)' }} />
              <input
                autoFocus
                className="w-full bg-transparent text-base outline-none"
                style={{ color: 'var(--text)' }}
                placeholder="Search commands, pages, and quick actions..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close command palette">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative p-3">
              {filtered.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm" style={{ color: 'var(--muted)' }}>
                  No command found.
                </div>
              ) : (
                filtered.map((action) => (
                  <button
                    key={action.label}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-white/10"
                    onClick={() => runAction(action.path)}
                    style={{ color: 'var(--text)' }}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                      <action.icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-sm font-semibold">{action.label}</span>
                    <Search className="h-4 w-4" style={{ color: 'var(--soft)' }} />
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
