import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import UserDashboard from './pages/user/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import { LogOut, Film, ShieldCheck, User, Ticket } from 'lucide-react';

// ─── Route Guards ──────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
};

// ─── Navbar ────────────────────────────────────────────────────────────────────
const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-30 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center shadow-md group-hover:shadow-rose-500/30 transition-shadow">
            <Film className="text-white" size={18} />
          </div>
          <span className="text-lg font-black text-white tracking-tight">TicketTales</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {token ? (
            <>
              <div className="hidden sm:flex items-center gap-2 glass px-3 py-1.5 rounded-xl">
                <div className="w-6 h-6 gradient-brand rounded-lg flex items-center justify-center">
                  {user.role === 'admin' ? <ShieldCheck size={12} className="text-white" /> : <User size={12} className="text-white" />}
                </div>
                <span className="text-slate-300 text-xs font-semibold">{user.name || user.email}</span>
                {user.role === 'admin' && <span className="text-xs bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded-full font-bold">Admin</span>}
              </div>

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-purple-300 hover:bg-purple-500/10 transition-all"
                >
                  <ShieldCheck size={14} /> Admin Panel
                </Link>
              )}

              {user.role !== 'admin' && (
                <Link
                  to="/"
                  className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Ticket size={14} /> My Bookings
                </Link>
              )}

              <button
                id="logout-btn"
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              >
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-bold gradient-brand text-white px-4 py-2 rounded-xl btn-glow"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// ─── App ───────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0f0f13] text-slate-100 font-sans">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<UserDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
