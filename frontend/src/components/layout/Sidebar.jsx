import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Boxes, ChevronLeft, ChevronsUpDown, LayoutDashboard, PackageCheck, ShoppingCart, Users, X } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', metric: 'Live' },
  { to: '/products', icon: Boxes, label: 'Inventory', metric: 'SKUs' },
  { to: '/customers', icon: Users, label: 'Customers', metric: 'CRM' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders', metric: 'Flow' },
];

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapsed }) {
  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r p-3 transition-[width,transform] duration-300 ${
          collapsed ? 'lg:w-[92px]' : 'lg:w-[288px]'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} w-[288px]`}
        style={{
          background: 'linear-gradient(180deg, rgba(15,23,42,0.86), rgba(15,23,42,0.72))',
          borderColor: 'rgba(255,255,255,0.10)',
          boxShadow: 'var(--shadow-xl)',
          backdropFilter: 'blur(28px) saturate(1.3)',
        }}
      >
        <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.06] p-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/30">
              <PackageCheck className="h-6 w-6" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-base font-extrabold tracking-tight text-white">InventoHub</p>
                <p className="truncate text-xs font-semibold text-slate-400">Enterprise Cloud</p>
              </div>
            )}
          </div>
          <button className="icon-btn border-white/10 bg-white/10 text-white lg:hidden" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <button
          className="mt-3 hidden items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/[0.08] lg:flex"
          onClick={onToggleCollapsed}
        >
          <ChevronLeft className={`h-4 w-4 transition ${collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && 'Collapse'}
        </button>

        <nav className="mt-5 flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 overflow-hidden rounded-3xl px-3 py-3 text-sm font-bold transition ${
                  isActive ? 'text-white' : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-3xl bg-white/[0.10] shadow-lg"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${isActive ? 'bg-white text-slate-950' : 'bg-white/[0.07]'}`}>
                    <item.icon className="h-5 w-5" />
                  </span>
                  {!collapsed && (
                    <span className="relative flex min-w-0 flex-1 items-center justify-between">
                      <span className="truncate">{item.label}</span>
                      <span className="rounded-full bg-white/[0.07] px-2 py-1 text-[10px] uppercase tracking-wider text-slate-400">
                        {item.metric}
                      </span>
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
              <BarChart3 className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">Inventory health</p>
                <p className="text-xs text-slate-400">Synced moments ago</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300" />
            </div>
          )}
        </div>

        {!collapsed && (
          <button className="mt-3 flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.05] px-4 py-3 text-left text-sm font-bold text-white">
            Workspace
            <ChevronsUpDown className="h-4 w-4 text-slate-400" />
          </button>
        )}
      </motion.aside>
    </>
  );
}
