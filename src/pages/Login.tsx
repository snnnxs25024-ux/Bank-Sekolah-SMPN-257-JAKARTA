import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy login logic
    login({
      id: 'u1',
      name: 'Admin User',
      email: email,
      role: 'Admin',
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto relative overflow-hidden">
      
      {/* Top Decorative Abstract Waves (3 Layers) */}
      <div className="absolute top-0 left-0 w-full z-0">
        <svg viewBox="0 0 1440 320" className="w-full h-auto text-primary-200 fill-current opacity-80" preserveAspectRatio="none" style={{ height: '180px' }}>
          <path d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,96C672,96,768,128,864,133.3C960,139,1056,117,1152,101.3C1248,85,1344,75,1392,69.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>
      <div className="absolute top-0 left-0 w-full z-0">
        <svg viewBox="0 0 1440 320" className="w-full h-auto text-primary-400 fill-current opacity-80" preserveAspectRatio="none" style={{ height: '150px' }}>
          <path d="M0,128L48,117.3C96,107,192,85,288,96C384,107,480,149,576,149.3C672,149,768,107,864,96C960,85,1056,107,1152,117.3C1248,128,1344,128,1392,128L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>
      <div className="absolute top-0 left-0 w-full z-0">
        <svg viewBox="0 0 1440 320" className="w-full h-auto text-primary-600 fill-current" preserveAspectRatio="none" style={{ height: '110px' }}>
          <path d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,165.3C960,192,1056,224,1152,213.3C1248,203,1344,149,1392,122.7L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 relative z-10 pt-16">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <img 
            src="https://i.imgur.com/YQ1YCei.png" 
            alt="Logo Bank Sekolah" 
            className="w-32 h-32 mx-auto mb-6 object-cover rounded-full shadow-lg border-4 border-white"
          />
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">BANK SEKOLAH</h1>
          <h2 className="text-lg font-bold text-primary-600 mt-1">SMPN 257 JAKARTA</h2>
          <p className="text-slate-500 text-sm mt-3">Silakan masuk ke akun Anda</p>
        </div>

        {/* Form Section (No Floating Card) */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email / Username</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors placeholder:text-slate-400"
              placeholder="Masukkan username"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors placeholder:text-slate-400"
              placeholder="Masukkan password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 text-white font-bold py-4 rounded-lg hover:bg-primary-700 transition-colors mt-8 shadow-lg shadow-primary-600/30"
          >
            LOGIN SEKARANG
          </button>
        </form>
      </div>

      {/* Bottom Decorative Abstract Waves (3 Layers) & Credits */}
      <div className="relative mt-auto">
        <div className="absolute bottom-0 left-0 w-full z-0">
          <svg viewBox="0 0 1440 320" className="w-full h-auto text-primary-200 fill-current opacity-60" preserveAspectRatio="none" style={{ height: '220px' }}>
            <path d="M0,192L48,208C96,224,192,256,288,245.3C384,235,480,181,576,149.3C672,117,768,107,864,128C960,149,1056,203,1152,213.3C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-full z-0">
          <svg viewBox="0 0 1440 320" className="w-full h-auto text-primary-400 fill-current opacity-50" preserveAspectRatio="none" style={{ height: '170px' }}>
             <path d="M0,256L48,229.3C96,203,192,149,288,154.7C384,160,480,224,576,218.7C672,213,768,139,864,128C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-full z-0">
          <svg viewBox="0 0 1440 320" className="w-full h-auto text-primary-600 fill-current opacity-30" preserveAspectRatio="none" style={{ height: '120px' }}>
            <path d="M0,128L48,160C96,192,192,256,288,272C384,288,480,256,576,213.3C672,171,768,117,864,106.7C960,96,1056,128,1152,149.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        <div className="pb-8 pt-32 text-center relative z-10">
          <p className="text-xs font-semibold text-primary-800 drop-shadow-sm">
            Made by <span className="font-bold">Iskandar Pratama Technologies</span>
          </p>
        </div>
      </div>

    </div>
  );
}
