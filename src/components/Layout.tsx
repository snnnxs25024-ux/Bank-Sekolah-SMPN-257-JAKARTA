import { useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, CheckSquare, BarChart2, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

export default function Layout() {
  const fetchInitialData = useStore((state) => state.fetchInitialData);
  const location = useLocation();
  const isWide = location.pathname.startsWith('/reports') || 
                 location.pathname.startsWith('/checklist') || 
                 location.pathname.startsWith('/master-student');

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return (
    <div className={cn(
      "min-h-screen bg-slate-50 flex flex-col mx-auto relative shadow-xl overflow-hidden pb-16 print:pb-0 print:max-w-none print:shadow-none print:bg-white",
      isWide ? "w-full max-w-4xl" : "w-full max-w-md sm:max-w-lg"
    )}>
      <div className="flex-1 overflow-y-auto print:overflow-visible">
        <Outlet />
      </div>
      
      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 z-50 rounded-t-xl print:hidden">
        <NavItem to="/" icon={<Home className="w-5 h-5" />} label="Beranda" />
        <NavItem to="/period" icon={<CheckSquare className="w-5 h-5" />} label="Kegiatan" />
        <NavItem to="/recap-all" icon={<BarChart2 className="w-5 h-5" />} label="Rekap" />
        <NavItem to="/master-student" icon={<Settings className="w-5 h-5" />} label="Lainnya" />
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
          isActive ? "text-primary-600 font-semibold" : "text-slate-400 hover:text-slate-600"
        )
      }
    >
      {icon}
      <span className="text-[10px]">{label}</span>
    </NavLink>
  );
}
