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
      email,
      role: 'Admin',
    });
    navigate('/');
  };

  return (
    <div className="relative isolate min-h-[100svh] overflow-hidden bg-[#f8fafc] text-[#102a56]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0" aria-hidden="true">
        <svg
          viewBox="0 0 1440 260"
          preserveAspectRatio="none"
          className="block h-[138px] w-full sm:h-[168px] lg:h-[190px]"
        >
          <path
            fill="#f6bb35"
            fillOpacity="0.42"
            d="M0 0h1440v108c-162 54-315 66-462 35-176-37-298-25-442 19-171 52-350 55-536-3V0Z"
          />
          <path
            fill="#28476f"
            fillOpacity="0.88"
            d="M0 0h1440v72c-196 70-374 79-535 29-172-53-316-44-467 5-151 49-297 53-438 12V0Z"
          />
          <path
            fill="#102a56"
            d="M0 0h1440v42c-178 65-355 72-532 21-176-50-337-43-488 5C274 115 134 113 0 78V0Z"
          />
        </svg>
      </div>

      <main className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-md flex-col px-6 pb-40 pt-16 sm:px-8 sm:pb-44 sm:pt-20">
        <div className="my-auto">
          <header className="mb-7 text-center">
            <img
              src="/brand/smpn-257-logo.png"
              alt="Logo Komite Sekolah SMPN 257 Jakarta"
              className="mx-auto mb-5 h-auto w-44 object-contain drop-shadow-[0_10px_22px_rgba(16,42,86,0.16)] sm:w-48"
            />
            <h1 className="text-3xl font-bold leading-none tracking-[-0.03em] text-[#102a56]">
              BANK SEKOLAH
            </h1>
            <h2 className="mt-2 text-base font-bold tracking-[0.08em] text-[#b77808]">
              SMPN 257 JAKARTA
            </h2>
            <p className="mt-3 text-sm text-slate-500">Silakan masuk ke akun Anda</p>
          </header>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Email / Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#28476f] focus:ring-4 focus:ring-[#28476f]/10"
                placeholder="Masukkan username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#28476f] focus:ring-4 focus:ring-[#28476f]/10"
                placeholder="Masukkan password"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="min-h-12 w-full rounded-md bg-gradient-to-r from-[#102a56] to-[#28476f] px-5 font-bold tracking-[0.04em] text-white shadow-[0_10px_24px_rgba(16,42,86,0.22)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f6bb35]/50 active:translate-y-px"
              >
                LOGIN SEKARANG
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-40 overflow-hidden sm:h-44">
        <svg
          viewBox="0 0 1440 240"
          preserveAspectRatio="none"
          className="absolute bottom-9 left-1/2 h-[calc(100%-2.25rem)] -translate-x-1/2"
          style={{ width: 'max(100%, 900px)' }}
          aria-hidden="true"
        >
          <path
            fill="#f6bb35"
            fillOpacity="0.13"
            d="M0 154c210-42 354-35 533 4 193 42 340 35 493-3 151-38 279-35 414-4v89H0v-86Z"
          />

          <g fill="#102a56" fillOpacity="0.14">
            <circle cx="214" cy="145" r="34" />
            <rect x="207" y="145" width="14" height="54" rx="3" />
            <circle cx="1226" cy="145" r="34" />
            <rect x="1219" y="145" width="14" height="54" rx="3" />

            <path d="M245 130h265l42 33H203l42-33Z" />
            <rect x="226" y="160" width="304" height="50" />
            <path d="M930 130h265l42 33H888l42-33Z" />
            <rect x="910" y="160" width="304" height="50" />

            <path d="M546 89h348l61 49H485l61-49Z" />
            <rect x="518" y="132" width="408" height="84" />
            <rect x="666" y="67" width="108" height="151" />
            <path d="M654 67h132l-66-45-66 45Z" />
            <rect x="716" y="22" width="7" height="47" />
          </g>

          <path fill="#f6bb35" fillOpacity="0.48" d="m723 24 51 14-51 16V24Z" />

          <g fill="#f8fafc" fillOpacity="0.72">
            <rect x="260" y="173" width="34" height="25" rx="2" />
            <rect x="326" y="173" width="34" height="25" rx="2" />
            <rect x="392" y="173" width="34" height="25" rx="2" />
            <rect x="458" y="173" width="34" height="25" rx="2" />
            <rect x="948" y="173" width="34" height="25" rx="2" />
            <rect x="1014" y="173" width="34" height="25" rx="2" />
            <rect x="1080" y="173" width="34" height="25" rx="2" />
            <rect x="1146" y="173" width="34" height="25" rx="2" />
            <rect x="558" y="151" width="45" height="35" rx="2" />
            <rect x="620" y="151" width="45" height="35" rx="2" />
            <rect x="775" y="151" width="45" height="35" rx="2" />
            <rect x="837" y="151" width="45" height="35" rx="2" />
            <path d="M690 164h60v54h-60z" />
          </g>

          <path fill="#102a56" fillOpacity="0.2" d="M0 207c235-14 465-9 692 4 259 15 502 12 748-5v34H0v-33Z" />
        </svg>

        <p className="absolute inset-x-4 bottom-[calc(0.5rem+env(safe-area-inset-bottom))] text-center text-xs font-semibold text-[#102a56]">
          Iskandar Pratama Technologies
        </p>
      </footer>
    </div>
  );
}
