import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function HistoryPage() {
  const { currentUser, isSupervisor } = useAuth();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: 'Semua',
    area: 'Semua'
  });

  const AREAS = ['Semua', 'Packing Line 1', 'Warehouse B', 'Utility Area', 'Raw Material Store', 'Produksi Area 2'];

  useEffect(() => {
    fetchHistory();
  }, [currentUser, isSupervisor]);

  useEffect(() => {
    applyFilters();
  }, [items, filters]);

  const fetchHistory = async () => {
    if (!currentUser) return;
    setLoading(true);

    try {
      let q;
      
      if (isSupervisor) {
        // Supervisor can see all
        q = query(collection(db, 'morningRounds'), orderBy('created_at', 'desc'));
      } else {
        q = query(
          collection(db, 'morningRounds'),
          where('user.uid', '==', currentUser.uid),
          orderBy('created_at', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setItems(data);
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat riwayat');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...items];

    // Search by area or user
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(item =>
        item.area?.toLowerCase().includes(term) ||
        item.user?.email?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filters.status !== 'Semua') {
      result = result.filter(item => item.status === filters.status);
    }

    // Area filter
    if (filters.area !== 'Semua') {
      result = result.filter(item => item.area === filters.area);
    }

    setFilteredItems(result);
  };

  const getStatusBadge = (status) => {
    const map = {
      'Selesai': 'badge-success',
      'Progress': 'badge-progress',
      'Belum': 'badge-danger'
    };
    return <span className={`badge ${map[status] || ''}`}>{status}</span>;
  };

  return (
    <div className="pb-20 px-4 pt-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Riwayat Morning Round</h1>
        <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">
          {filteredItems.length} data
        </span>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari area atau petugas..."
            className="input pl-11"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <select 
            className="input select text-sm"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="Semua">Semua Status</option>
            <option value="Selesai">Selesai</option>
            <option value="Progress">Progress</option>
            <option value="Belum">Belum</option>
          </select>

          <select 
            className="input select text-sm"
            value={filters.area}
            onChange={(e) => setFilters({ ...filters, area: e.target.value })}
          >
            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">
          Tidak ada data yang cocok dengan filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Link
              key={item.id}
              to={`/detail/${item.id}`}
              className="card p-4 block active:scale-[0.985] transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-lg">{item.area}</div>
                  <div className="text-sm text-gray-500">
                    {item.user?.displayName || item.user?.email} • {item.tanggal}
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(item.status)}
                  <div className="text-[10px] text-gray-400 mt-1">
                    {item.created_at?.toDate ? format(item.created_at.toDate(), 'HH:mm', { locale: id }) : ''}
                  </div>
                </div>
              </div>

              {item.catatan && (
                <p className="text-xs text-gray-600 mt-2 line-clamp-2 border-l-2 border-gray-200 pl-2">
                  {item.catatan}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
