import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Email dan password wajib diisi');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login berhasil! Selamat datang.');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      let message = 'Login gagal. Periksa email dan password Anda.';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = 'Email atau password salah';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Format email tidak valid';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Terlalu banyak percobaan. Coba lagi nanti.';
      }
      
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-8 px-6 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-6">
          <ShieldCheck className="w-11 h-11 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">MORNING ROUND</h1>
        <p className="text-primary font-semibold text-xl mt-1">5R CHECKLIST</p>
        <p className="text-gray-500 mt-3 text-sm max-w-[260px] mx-auto">
          Aplikasi digital monitoring kebersihan & kerapian area kerja
        </p>
      </div>

      {/* Login Card */}
      <div className="flex-1 px-5 pb-8">
        <div className="card max-w-md mx-auto p-8">
          <h2 className="text-xl font-semibold text-center mb-6">Masuk ke Akun Anda</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email / Username</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="nama@perusahaan.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 py-3.5 text-base disabled:opacity-70"
            >
              {loading ? 'Memproses...' : 'MASUK'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Lupa password? Hubungi Supervisor atau Admin IT
            </p>
          </div>
        </div>

        {/* Demo credentials info */}
        <div className="max-w-md mx-auto mt-6 text-center">
          <p className="text-[10px] text-gray-400">
            Demo: Gunakan akun yang sudah dibuat di Firebase Authentication.<br />
            Role diatur di Firestore collection "users"
          </p>
        </div>
      </div>
    </div>
  );
}
