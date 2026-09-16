import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { User, Lock, LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      id: 'u1',
      name: 'Admin User',
      email: email || 'admin@smpn257.sch.id',
      role: 'Admin',
    });
    navigate('/');
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/50 text-[#102a56]">
      {/* Floating Login Card */}
      <main className="w-full max-w-md bg-white rounded-3xl p-7 sm:p-9 shadow-[0_20px_50px_-10px_rgba(16,42,86,0.18)] border border-slate-200/80 transition-all duration-300 relative">
        <header className="mb-6 text-center">
          {/* Logo diperkecil sedikit */}
          <img
            src="/brand/smpn-257-logo.png"
            alt="Logo SMPN 257 Jakarta"
            className="mx-auto mb-3 h-auto w-20 sm:w-24 object-contain drop-shadow-md transition-transform hover:scale-105 duration-200"
          />
          <h1 className="text-xl sm:text-2xl font-black leading-tight tracking-tight text-[#102a56]">
            BANK SAMPAH SEKOLAH
          </h1>
          <h2 className="mt-1 text-xs sm:text-sm font-bold tracking-[0.12em] text-[#b77808]">
            SMPN 257 JAKARTA
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Silakan masuk ke akun Anda
          </p>
        </header>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Email / Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 text-sm text-slate-900 shadow-xs outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-[#28476f] focus:ring-4 focus:ring-[#28476f]/10"
                placeholder="Masukkan username"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 text-sm text-slate-900 shadow-xs outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-[#28476f] focus:ring-4 focus:ring-[#28476f]/10"
                placeholder="Masukkan password"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="min-h-12 w-full rounded-xl bg-gradient-to-r from-[#102a56] to-[#28476f] px-5 font-bold tracking-[0.05em] text-white shadow-md shadow-[#102a56]/20 transition hover:brightness-110 hover:shadow-lg hover:shadow-[#102a56]/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f6bb35]/50 active:scale-[0.99] flex items-center justify-center space-x-2"
            >
              <span>LOGIN SEKARANG</span>
              <LogIn className="w-4 h-4" />
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-xs font-medium text-slate-400">
          Iskandar Pratama Technologies
        </p>
      </main>
    </div>
  );
}
