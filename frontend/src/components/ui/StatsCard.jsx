import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export default function StatsCard({ title, value, icon: Icon, tone = 'indigo', trend = '+12.4%', caption = 'vs last period' }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-80, 80], [5, -5]), { stiffness: 260, damping: 24 });
  const rotateY = useSpring(useTransform(x, [-120, 120], [-5, 5]), { stiffness: 260, damping: 24 });

  const tones = {
    indigo: 'from-indigo-500 to-cyan-400',
    emerald: 'from-emerald-500 to-teal-300',
    amber: 'from-amber-400 to-orange-500',
    rose: 'from-rose-500 to-fuchsia-500',
  };

  return (
    <motion.div
      className="premium-card overflow-hidden p-5"
      style={{ rotateX, rotateY }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - rect.left - rect.width / 2);
        y.set(event.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <div className={`absolute -right-10 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${tones[tone]} opacity-20 blur-2xl`} />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--muted)' }}>{title}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tones[tone]} text-white shadow-lg`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="relative mt-5 flex items-center gap-2 text-sm font-bold text-emerald-500">
        <ArrowUpRight className="h-4 w-4" />
        {trend}
        <span className="font-semibold" style={{ color: 'var(--muted)' }}>{caption}</span>
      </div>
    </motion.div>
  );
}
