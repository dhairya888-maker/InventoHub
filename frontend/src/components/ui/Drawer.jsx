import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function Drawer({ isOpen, onClose, title, eyebrow, children, width = 'max-w-xl' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className={`absolute right-0 top-0 h-full w-full ${width} overflow-y-auto border-l p-6`}
            style={{
              background: 'var(--panel)',
              borderColor: 'var(--line)',
              boxShadow: 'var(--shadow-xl)',
              backdropFilter: 'var(--blur)',
            }}
            initial={{ x: '100%', opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.8 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                  {title}
                </h2>
              </div>
              <button className="icon-btn" onClick={onClose} aria-label="Close drawer">
                <X className="h-4 w-4" />
              </button>
            </div>
            {children}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
