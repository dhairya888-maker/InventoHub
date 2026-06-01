import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, PackageCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Workspace created');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-grid relative grid min-h-screen place-items-center overflow-hidden px-4 py-8">
      <div className="aurora" />
      <motion.section
        className="glass-card relative w-full max-w-md p-6 sm:p-8"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/25">
            <PackageCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>InventoHub</p>
            <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Create workspace</p>
          </div>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>Start your command center</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Create a secure local preview session with a JWT-style token.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-bold" style={{ color: 'var(--text)' }}>Name</span>
            <span className="relative block">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--soft)' }} />
              <input className="field field-with-left-icon" value={form.name} onChange={(event) => update('name', event.target.value)} />
            </span>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold" style={{ color: 'var(--text)' }}>Email</span>
            <span className="relative block">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--soft)' }} />
              <input className="field field-with-left-icon" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} />
            </span>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold" style={{ color: 'var(--text)' }}>Password</span>
            <span className="relative block">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--soft)' }} />
              <input className="field field-with-icons" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => update('password', event.target.value)} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 p-2" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
          </label>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--muted)' }}>
          Already have access? <Link className="font-bold text-indigo-500" to="/login">Sign in</Link>
        </p>
      </motion.section>
    </main>
  );
}
