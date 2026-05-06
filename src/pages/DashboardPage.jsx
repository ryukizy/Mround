import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProgressCircle from '../components/ProgressCircle';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { currentUser, userRole } = useAuth();
  const [stats, setStats] = useState({ selesai: 0, progress: 0, belum: 0, total: 0 });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  const fetchDashboardData = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const q = query(
        collection(db, 'morningRounds'),
        where('user.uid', '==', currentUser.uid),
        orderBy('created_at', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate stats
      let selesai = 0, progress = 0, belum = 0;
      
      items.forEach(item => {
        if (item.status === 'Selesai') selesai++;
        else if (item.status === 'Progress') progress++;
        else belum++;
      });

      setStats({
        selesai,
        progress,
        belum,
        total: items.length || 17 // fallback for demo
      });

      setRecentItems(items.slice(0, 4));
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = stats.total > 0 
    ? Math.round((stats.selesai / stats.total) * 100) 
    : 0;

  const getStatusBadge = (status) => {
    if (status === 'Selesai') return <span className="badge badge-success">Selesai</span>;
    if (status === 'Progress') return <span className="badge badge-progress">Progress</span>;
    return <span className="badge badge-danger">Belum</span>;
  };

  return (
    <div className="pb-20 px-4 pt-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">Selamat pagi,</p>
          <h1 className="text-2xl font-bold text-gray-900">{currentUser?.email?.split('@')[0] || 'Petugas'}</h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Hari ini</p>
          <p className="font-semibold text-sm">{format(new Date(), 'dd MMM yyyy', { locale: id })}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-4 text-center">
          <div className="flex justify-center mb-1">
            <CheckCircle className="w-6 h-6 text-success" />
          </div>
          <div className="text-2xl font-bold text-success">{stats.selesai}</div>
          <div className="text-xs text-gray-500">Selesai</div>
        </div>
        <div className="card p-4 text-center">
          <div className="flex justify-center mb-1">
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.progress}</div>
          <div className="text-xs text-gray-500">Progress</div>
        </div>
        <div className="card p-4 text-center">
          <div className="flex justify-center mb-1">
            <AlertCircle className="w-6 h-6 text-danger" />
          </div>
          <div className="text-2xl font-bold text-danger">{stats.belum}</div>
          <div className="text-xs text-gray-500">Belum</div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Progress Area</h3>
            <p className="text-xs text-gray-500">Total {stats.total} area</p>
          </div>
          <ProgressCircle percentage={progressPercentage} />
        </div>
        
        <div className="flex justify-between text-xs mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-success"></div>
            <span>Selesai ({stats.selesai})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
            <span>Progress ({stats.progress})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-danger"></div>
            <span>Belum ({stats.belum})</span>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <Link 
        to="/checklist" 
        className="btn-primary w-full flex items-center justify-center gap-2 mb-6 py-3.5 text-base shadow-lg shadow-primary/20"
      >
        <Plus size={20} /> Mulai Morning Round Baru
      </Link>

      {/* Recent Activity */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Area Terakhir Diperbarui</h3>
        <Link to="/history" className="text-xs text-primary font-medium">Lihat Semua →</Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}
        </div>
      ) : recentItems.length > 0 ? (
        <div className="space-y-3">
          {recentItems.map((item) => (
            <Link 
              key={item.id} 
              to={`/detail/${item.id}`}
              className="card p-4 flex items-center justify-between active:scale-[0.985] transition-transform"
            >
              <div>
                <div className="font-semibold text-gray-900">{item.area}</div>
                <div className="text-xs text-gray-500">
                  {item.user?.displayName || item.user?.email} • {item.tanggal}
                </div>
              </div>
              <div>{getStatusBadge(item.status)}</div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center text-gray-500 text-sm">
          Belum ada data Morning Round.<br />Mulai isi checklist pertama Anda.
        </div>
      )}

      {/* Role info for supervisor */}
      {userRole === 'supervisor' && (
        <div className="mt-6 text-center">
          <p className="text-xs bg-amber-100 text-amber-700 inline-block px-3 py-1 rounded-full">
            Mode Supervisor • Anda dapat melihat semua laporan
          </p>
        </div>
      )}
    </div>
  );
}
