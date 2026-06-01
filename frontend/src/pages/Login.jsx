import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, PackageCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Login() {
  const { login, demo } = useAuth();
  const { mode, setMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(demo.email);
  const [password, setPassword] = useState(demo.password);
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login({ email, password, remember });
      toast.success('Welcome back to InventoHub');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-grid relative min-h-screen overflow-hidden px-4 py-8">
      <div className="aurora" />
      <motion.div
        className="absolute left-[9%] top-[18%] h-28 w-28 rounded-[28px] border border-white/30 bg-white/30 shadow-2xl backdrop-blur-2xl"
        animate={{ y: [0, -18, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[14%] right-[10%] h-36 w-36 rounded-full border border-cyan-300/30 bg-cyan-300/20 blur-[1px]"
        animate={{ y: [0, 22, 0], x: [0, -14, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:block"
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/30 px-4 py-2 text-sm font-semibold backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            Premium inventory command center
          </div>
          <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.02] tracking-tight" style={{ color: 'var(--text)' }}>
            Inventory operations with the polish of a modern SaaS flagship.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8" style={{ color: 'var(--muted)' }}>
            Track stock health, revenue, orders, and customer activity from a calm, high-signal workspace built for business teams.
          </p>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {['Live stock', 'Smart orders', 'Revenue pulse'].map((item) => (
              <div key={item} className="glass-card px-4 py-5 text-sm font-bold">
                {item}
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="glass-card mx-auto w-full max-w-md p-6 sm:p-8"
        >
          <div className="relative">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/25">
                  <PackageCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>InventoHub</p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Enterprise console</p>
                </div>
              </div>
              <select className="field max-w-[118px] py-2 text-xs" value={mode} onChange={(event) => setMode(event.target.value)}>
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>Welcome back</h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Sign in to your operations workspace.</p>

            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-bold" style={{ color: 'var(--text)' }}>Email</span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--soft)' }} />
                  <input className="field pl-11" value={email} onChange={(event) => setEmail(event.target.value)} />
                </span>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold" style={{ color: 'var(--text)' }}>Password</span>
                <span className="relative block">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--soft)' }} />
                  <input
                    className="field px-11"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 p-2" onClick={() => setShowPassword((value) => !value)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </span>
              </label>
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                  <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                  Remember me
                </label>
                <button type="button" className="text-sm font-bold text-indigo-500">Forgot password?</button>
              </div>
              <button className="btn-primary w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 rounded-3xl border p-4" style={{ borderColor: 'var(--line)', background: 'color-mix(in srgb, var(--brand), transparent 92%)' }}>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em]" style={{ color: 'var(--muted)' }}>Demo credentials</p>
              <div className="mt-3 space-y-2 text-sm font-semibold" style={{ color: 'var(--text)' }}>
                <p>Email: {demo.email}</p>
                <p>Password: {demo.password}</p>
              </div>
            </div>

            <p className="mt-6 text-center text-sm" style={{ color: 'var(--muted)' }}>
              New workspace? <Link className="font-bold text-indigo-500" to="/register">Create an account</Link>
            </p>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
