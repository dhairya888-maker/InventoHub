import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

export default function EmptyState({ title, message, icon: Icon = Inbox, action }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center px-6 py-16 text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[24px] bg-indigo-500/10 text-indigo-500 shadow-lg shadow-indigo-500/10">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6" style={{ color: 'var(--muted)' }}>{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
