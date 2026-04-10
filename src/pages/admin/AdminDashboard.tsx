import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Users, Film, Ticket, CheckCircle, Ban, Trash2, Plus, X,
  TrendingUp, ShieldCheck, Clock, Loader2, RefreshCw
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="glass rounded-2xl p-5 flex items-center gap-4 card-hover">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-black text-white">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'movies' | 'bookings'>('users');
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [newMovie, setNewMovie] = useState({ title: '', price: '', seatsAvailable: '' });
  const [movieFormLoading, setMovieFormLoading] = useState(false);
  const navigate = useNavigate();

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [u, m, b] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/movies'),
        api.get('/admin/bookings'),
      ]);
      setUsers(u.data);
      setMovies(m.data);
      setBookings(b.data);
    } catch (err: any) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        navigate('/');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUserAction = async (id: string, action: 'approve' | 'block' | 'delete') => {
    try {
      if (action === 'delete' && !confirm('Delete this user permanently?')) return;
      if (action === 'delete') await api.delete(`/admin/user/${id}`);
      else await api.put(`/admin/${action}/${id}`);
      fetchData(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleMovieDelete = async (id: string) => {
    if (!confirm('Delete this movie and all its bookings?')) return;
    try {
      await api.delete(`/admin/movie/${id}`);
      fetchData(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setMovieFormLoading(true);
    try {
      await api.post('/admin/movie', newMovie);
      setNewMovie({ title: '', price: '', seatsAvailable: '' });
      setShowMovieForm(false);
      fetchData(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setMovieFormLoading(false);
    }
  };

  const pendingUsers = users.filter(u => u.status === 'pending').length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.movie?.price || 0) * b.seats, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center animate-pulse">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <p className="text-slate-400 text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Add Movie Modal */}
      {showMovieForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowMovieForm(false)} />
          <div className="relative glass-strong rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <button onClick={() => setShowMovieForm(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
              <X size={22} />
            </button>
            <h2 className="text-2xl font-black text-white mb-1">Add New Movie</h2>
            <p className="text-slate-400 text-sm mb-6">Fill in the details to add a new show</p>
            <form onSubmit={handleAddMovie} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Movie Title</label>
                <input required value={newMovie.title} onChange={e => setNewMovie({ ...newMovie, title: e.target.value })}
                  placeholder="e.g. Kalki 2898-AD"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-slate-600 focus:outline-none focus:border-rose-500/60 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Price (₹)</label>
                  <input required type="number" min="1" value={newMovie.price} onChange={e => setNewMovie({ ...newMovie, price: e.target.value })}
                    placeholder="250"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-slate-600 focus:outline-none focus:border-rose-500/60 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Seats</label>
                  <input required type="number" min="1" value={newMovie.seatsAvailable} onChange={e => setNewMovie({ ...newMovie, seatsAvailable: e.target.value })}
                    placeholder="100"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-slate-600 focus:outline-none focus:border-rose-500/60 transition-all" />
                </div>
              </div>
              <button type="submit" disabled={movieFormLoading}
                className="w-full gradient-brand text-white font-bold py-3.5 rounded-xl btn-glow disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-2">
                {movieFormLoading ? <><Loader2 size={18} className="animate-spin" /> Adding...</> : <><Plus size={16} /> Add Movie</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative glass shine rounded-3xl px-8 py-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-600/15 via-transparent to-purple-700/15" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-widest mb-2">
              <ShieldCheck size={14} /> Admin Panel
            </div>
            <h1 className="text-3xl font-black text-white">Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Manage users, movies, and all bookings</p>
          </div>
          <button onClick={() => fetchData(true)} disabled={refreshing}
            className="flex items-center gap-2 glass px-4 py-2.5 rounded-xl text-slate-300 hover:text-white text-sm font-semibold transition-all disabled:opacity-50 w-fit">
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={users.length} icon={Users} color="bg-gradient-to-br from-blue-600 to-indigo-600" />
        <StatCard label="Movies" value={movies.length} icon={Film} color="bg-gradient-to-br from-purple-600 to-violet-600" />
        <StatCard label="Bookings" value={bookings.length} icon={Ticket} color="bg-gradient-to-br from-rose-600 to-pink-600" />
        <StatCard label="Revenue ₹" value={totalRevenue.toLocaleString('en-IN')} icon={TrendingUp} color="bg-gradient-to-br from-emerald-600 to-teal-600" />
      </div>

      {pendingUsers > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-6 py-4 flex items-center gap-3">
          <Clock size={18} className="text-amber-400 shrink-0" />
          <p className="text-amber-300 text-sm">
            <strong>{pendingUsers} user{pendingUsers > 1 ? 's' : ''}</strong> waiting for approval. Go to the Users tab to approve them.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-2xl w-fit">
        {(['users', 'movies', 'bookings'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize ${activeTab === tab ? 'gradient-brand text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            {tab === 'users' && <Users size={14} />}
            {tab === 'movies' && <Film size={14} />}
            {tab === 'bookings' && <Ticket size={14} />}
            {tab}{tab === 'users' && pendingUsers > 0 && <span className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingUsers}</span>}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="glass rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Users size={18} className="text-blue-400" /> User Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white text-sm">{user.name || 'No Name'}</p>
                      <p className="text-slate-500 text-xs">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        user.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' :
                        user.status === 'blocked' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>{user.status}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {user.status !== 'approved' && (
                          <button onClick={() => handleUserAction(user.id, 'approve')} title="Approve"
                            className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all">
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {user.status !== 'blocked' && (
                          <button onClick={() => handleUserAction(user.id, 'block')} title="Block"
                            className="p-2 text-amber-400 hover:bg-amber-400/10 rounded-lg transition-all">
                            <Ban size={16} />
                          </button>
                        )}
                        <button onClick={() => handleUserAction(user.id, 'delete')} title="Delete"
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Movies Tab */}
      {activeTab === 'movies' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button id="add-movie-btn" onClick={() => setShowMovieForm(true)}
              className="flex items-center gap-2 gradient-brand text-white text-sm font-bold px-5 py-2.5 rounded-xl btn-glow">
              <Plus size={16} /> Add Movie
            </button>
          </div>
          <div className="glass rounded-3xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><Film size={18} className="text-purple-400" /> Movie Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Price</th>
                    <th className="px-6 py-3">Seats Available</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map(m => (
                    <tr key={m.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white text-sm">{m.title}</p>
                      </td>
                      <td className="px-6 py-4 text-rose-400 font-bold text-sm">₹{m.price}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${m.seatsAvailable > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                          {m.seatsAvailable} left
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleMovieDelete(m.id)} title="Delete"
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {movies.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">No movies yet. Add your first movie!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="glass rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Ticket size={18} className="text-rose-400" /> All Bookings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Movie</th>
                  <th className="px-6 py-3">Seats</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white text-sm">{b.user?.name || 'Unknown'}</p>
                      <p className="text-slate-500 text-xs">{b.user?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{b.movie?.title}</td>
                    <td className="px-6 py-4">
                      <span className="text-rose-400 font-black text-base">{b.seats}</span>
                    </td>
                    <td className="px-6 py-4 text-emerald-400 font-semibold text-sm">
                      ₹{((b.movie?.price || 0) * b.seats).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(b.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No bookings yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
