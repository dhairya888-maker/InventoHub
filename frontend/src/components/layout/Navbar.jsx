import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCircle2, LogOut, Menu, Moon, Search, Settings, Sun, User, Wand2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar({ onMenuClick, title, subtitle }) {
  const { user, logout } = useAuth();
  const { mode, setMode } = useTheme();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const cycleTheme = () => {
    setMode(mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light');
  };

  return (
    <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="glass-panel rounded-[24px] px-4 py-3">
        <div className="flex items-center gap-4">
          <button className="icon-btn lg:hidden" onClick={onMenuClick} aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate text-xl font-extrabold tracking-tight sm:text-2xl" style={{ color: 'var(--text)' }}>
                {title}
              </h1>
              <span className="badge badge-success hidden sm:inline-flex">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Synced
              </span>
            </div>
            <p className="mt-1 hidden truncate text-sm sm:block" style={{ color: 'var(--muted)' }}>
              {subtitle}
            </p>
          </div>

          <button
            className="hidden min-w-[260px] items-center gap-3 rounded-2xl border px-4 py-2.5 text-left text-sm font-semibold md:flex"
            style={{ borderColor: 'var(--line)', background: 'var(--panel-muted)', color: 'var(--muted)' }}
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
          >
            <Search className="h-4 w-4" />
            Global search
            <span className="ml-auto rounded-lg border px-2 py-0.5 text-xs" style={{ borderColor: 'var(--line)' }}>Ctrl K</span>
          </button>

          <button className="icon-btn" onClick={cycleTheme} aria-label="Change theme">
            {mode === 'dark' ? <Moon className="h-4 w-4" /> : mode === 'light' ? <Sun className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
          </button>

          <div className="relative">
            <button className="icon-btn" onClick={() => setNotificationsOpen((value) => !value)} aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
            </button>
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  className="glass-card absolute right-0 mt-3 w-80 p-3"
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                >
                  {['Low stock review queued', 'Revenue chart refreshed', 'Order timeline updated'].map((item) => (
                    <div key={item} className="relative rounded-2xl px-3 py-3 text-sm font-semibold" style={{ color: 'var(--text)' }}>
                      {item}
                      <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>Just now</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button className="flex items-center gap-2 rounded-2xl border p-1.5 pr-3" style={{ borderColor: 'var(--line)', background: 'var(--panel-muted)' }} onClick={() => setProfileOpen((value) => !value)}>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-sm font-extrabold text-white">
                {user?.name?.slice(0, 1) || 'I'}
              </span>
              <span className="hidden text-left md:block">
                <span className="block text-sm font-bold leading-4" style={{ color: 'var(--text)' }}>{user?.name}</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>{user?.role}</span>
              </span>
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  className="glass-card absolute right-0 mt-3 w-64 p-2"
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                >
                  <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold" style={{ color: 'var(--text)' }}>
                    <User className="h-4 w-4" /> Profile
                  </button>
                  <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold" style={{ color: 'var(--text)' }}>
                    <Settings className="h-4 w-4" /> Settings
                  </button>
                  <button
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-red-500"
                    onClick={() => {
                      logout();
                      navigate('/login', { replace: true });
                    }}
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
