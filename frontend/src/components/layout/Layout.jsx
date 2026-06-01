import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const pageCopy = {
  '/': {
    title: 'Operations Dashboard',
    subtitle: 'Live inventory, revenue, orders, and risk signals in one workspace.',
  },
  '/products': {
    title: 'Inventory Control',
    subtitle: 'Manage stock, SKU health, pricing, and product availability.',
  },
  '/customers': {
    title: 'Customer Intelligence',
    subtitle: 'Understand accounts, contacts, order volume, and engagement.',
  },
  '/orders': {
    title: 'Order Command',
    subtitle: 'Track fulfillment, timelines, status, and revenue movement.',
  },
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const basePath = '/' + (location.pathname.split('/')[1] || '');
  const current = pageCopy[basePath] || pageCopy['/'];

  return (
    <div className="app-shell relative min-h-screen overflow-hidden">
      <div className="aurora" />
      <Sidebar
        isOpen={sidebarOpen}
        collapsed={collapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapsed={() => setCollapsed((value) => !value)}
      />
      <div
        className={`relative z-10 flex min-h-screen flex-col transition-[padding] duration-300 ${
          collapsed ? 'lg:pl-[92px]' : 'lg:pl-[288px]'
        }`}
      >
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={current.title} subtitle={current.subtitle} />
        <main className="flex-1 px-4 pb-8 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
                transition={{ duration: 0.24 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
