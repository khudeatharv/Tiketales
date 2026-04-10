import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Ticket, Film, Clock, X, Minus, Plus, Loader2, Star, Calendar, LayoutGrid } from 'lucide-react';

// Movie poster colors (cycle through for visual variety)
const POSTER_GRADIENTS = [
  'from-rose-600 to-orange-500',
  'from-violet-600 to-indigo-500',
  'from-emerald-600 to-teal-500',
  'from-amber-600 to-yellow-500',
  'from-sky-600 to-cyan-500',
  'from-pink-600 to-rose-500',
  'from-indigo-600 to-purple-500',
  'from-green-600 to-emerald-500',
];

interface BookingModalProps {
  movie: any;
  onClose: () => void;
  onConfirm: (seats: number) => void;
  loading: boolean;
}

const BookingModal: React.FC<BookingModalProps> = ({ movie, onClose, onConfirm, loading }) => {
  const [seats, setSeats] = useState(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-strong rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <X size={22} />
        </button>

        <h2 className="text-2xl font-black text-white mb-1">Book Tickets</h2>
        <p className="text-slate-400 text-sm mb-6">{movie.title}</p>

        <div className="bg-white/5 rounded-2xl p-5 mb-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Price per seat</span>
            <span className="text-white font-semibold">₹{movie.price}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Seats available</span>
            <span className="text-emerald-400 font-semibold">{movie.seatsAvailable}</span>
          </div>
          <div className="h-px bg-white/10" />
          <div className="flex justify-between">
            <span className="text-slate-400 text-sm">Total</span>
            <span className="text-rose-400 font-black text-xl">₹{(movie.price * seats).toFixed(0)}</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Number of Seats</label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSeats(s => Math.max(1, s - 1))}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            >
              <Minus size={16} />
            </button>
            <span className="text-3xl font-black text-white w-12 text-center">{seats}</span>
            <button
              onClick={() => setSeats(s => Math.min(movie.seatsAvailable, s + 1))}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <button
          id="confirm-booking-btn"
          onClick={() => onConfirm(seats)}
          disabled={loading}
          className="w-full gradient-brand text-white font-bold py-3.5 rounded-xl btn-glow flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : `Confirm & Pay ₹${(movie.price * seats).toFixed(0)}`}
        </button>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const [movies, setMovies] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'movies' | 'bookings'>('movies');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      const moviesRes = await api.get('/movies');
      setMovies(moviesRes.data);
      if (token) {
        const bookingsRes = await api.get('/user/bookings');
        setBookings(bookingsRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleBookTicket = async (seats: number) => {
    if (!token) { navigate('/login'); return; }
    setBookingLoading(true);
    try {
      await api.post('/user/book', { movieId: selectedMovie.id, seats });
      setSelectedMovie(null);
      setSuccessMsg(`🎉 Booked ${seats} seat(s) for "${selectedMovie.title}"!`);
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center animate-pulse">
            <Film className="text-white" size={32} />
          </div>
          <p className="text-slate-400 text-sm">Loading movies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {selectedMovie && (
        <BookingModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onConfirm={handleBookTicket}
          loading={bookingLoading}
        />
      )}

      {successMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-sm text-sm font-semibold">
          {successMsg}
        </div>
      )}

      {/* Hero */}
      <section className="relative rounded-3xl overflow-hidden glass shine">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-600/20 via-transparent to-purple-700/20" />
        <div className="relative px-8 py-12 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-widest mb-2">
            <span className="w-2 h-2 bg-rose-400 rounded-full pulse-dot" />
            Now Showing
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            Your next great<br />
            <span className="gradient-text">movie experience</span>
          </h1>
          <p className="text-slate-400 mt-2 max-w-md text-sm">
            Browse the latest shows, pick your seats, and book instantly.
          </p>
          <div className="flex items-center gap-6 mt-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><Film size={14} className="text-rose-400" /> {movies.length} Shows Available</span>
            {token && <span className="flex items-center gap-1.5"><Ticket size={14} className="text-purple-400" /> {bookings.length} My Bookings</span>}
          </div>
        </div>
      </section>

      {/* Tabs (only shown when logged in) */}
      {token && (
        <div className="flex gap-1 p-1 bg-white/5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('movies')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'movies' ? 'gradient-brand text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <LayoutGrid size={15} /> Movies
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'bookings' ? 'gradient-brand text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Ticket size={15} /> My Bookings {bookings.length > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{bookings.length}</span>}
          </button>
        </div>
      )}

      {/* Movies Grid */}
      {(!token || activeTab === 'movies') && (
        <section>
          {!token && <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2"><Film className="text-rose-500" size={22} /> Now Showing</h2>}
          {movies.length === 0 ? (
            <div className="text-center py-20 glass rounded-3xl">
              <Film className="mx-auto text-slate-600 mb-4" size={48} />
              <p className="text-slate-400 text-lg font-semibold">No movies available right now</p>
              <p className="text-slate-600 text-sm mt-1">Check back soon</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {movies.map((movie, idx) => (
                <div key={movie.id} className="glass rounded-2xl overflow-hidden flex flex-col card-hover group">
                  {/* Poster */}
                  <div className={`relative h-44 bg-gradient-to-br ${POSTER_GRADIENTS[idx % POSTER_GRADIENTS.length]} flex items-end p-4`}>
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-yellow-400 font-semibold">
                      <Star size={10} fill="currentColor" /> {(4.0 + (idx % 10) * 0.1).toFixed(1)}
                    </div>
                    <div className="relative">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white ${movie.seatsAvailable > 0 ? 'bg-emerald-500/60' : 'bg-red-500/60'}`}>
                        {movie.seatsAvailable > 0 ? `${movie.seatsAvailable} seats left` : 'Sold Out'}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex-1 flex flex-col gap-3">
                    <h3 className="font-bold text-white text-base leading-tight line-clamp-2">{movie.title}</h3>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Calendar size={11} /> Latest Show</span>
                      <span className="text-rose-400 font-black text-base">₹{movie.price}</span>
                    </div>
                    <button
                      id={`book-btn-${movie.id}`}
                      onClick={() => {
                        if (!token) navigate('/login');
                        else setSelectedMovie(movie);
                      }}
                      disabled={movie.seatsAvailable === 0}
                      className="mt-auto w-full gradient-brand text-white text-xs font-bold py-2.5 rounded-xl btn-glow disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all"
                    >
                      {movie.seatsAvailable > 0 ? 'Book Tickets' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* My Bookings */}
      {token && activeTab === 'bookings' && (
        <section>
          {bookings.length === 0 ? (
            <div className="text-center py-20 glass rounded-3xl">
              <Ticket className="mx-auto text-slate-600 mb-4" size={48} />
              <p className="text-slate-400 text-lg font-semibold">No bookings yet</p>
              <p className="text-slate-600 text-sm mt-1">Pick a movie and book your first ticket!</p>
              <button
                onClick={() => setActiveTab('movies')}
                className="mt-6 gradient-brand text-white text-sm font-bold px-6 py-2.5 rounded-xl btn-glow"
              >
                Browse Movies
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map((booking, idx) => (
                <div key={booking.id} className="glass rounded-2xl p-5 flex items-center gap-4 card-hover">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${POSTER_GRADIENTS[idx % POSTER_GRADIENTS.length]} flex items-center justify-center shrink-0`}>
                    <Film className="text-white" size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white truncate">{booking.movie?.title || 'Unknown Movie'}</h4>
                    <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                      <Clock size={11} /> {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block text-rose-400 font-black text-xl">{booking.seats}</span>
                    <span className="text-slate-500 text-xs">seat{booking.seats !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default UserDashboard;
