import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Calendar, Users, Home as HomeIcon, CheckSquare, BarChart, Download, LogOut } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { classes, students, activePeriod, activities, logout } = useStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate stats for current period
  const periodActivities = activities.filter(a => a.period_id === activePeriod?.id);
  const totalMijel = periodActivities.filter(a => a.mijel || (a as unknown as { deposit?: boolean }).deposit).length;
  const totalBS = periodActivities.filter(a => a.bank_sampah || (a as unknown as { withdrawal?: boolean }).withdrawal).length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">BANK SAMPAH SEKOLAH</h1>
          <p className="text-xs font-bold text-[#b77808] tracking-wider uppercase">SMPN 257 JAKARTA</p>
        </div>
        <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-primary-600 rounded-lg p-5 text-white shadow-lg shadow-primary-600/30 mb-6">
        <div className="flex items-center space-x-2 text-primary-100 mb-1 text-sm">
          <Calendar className="w-4 h-4" />
          <span>Periode Aktif</span>
        </div>
        <h2 className="text-2xl font-bold mb-4">{activePeriod?.month} {activePeriod?.year}</h2>
        <button 
          onClick={() => navigate('/period')}
          className="bg-white/20 hover:bg-white/30 transition-colors text-white text-sm px-4 py-2 rounded-lg font-medium"
        >
          Ganti Periode
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
          <div className="text-slate-500 text-sm mb-1 font-medium flex items-center space-x-2">
            <HomeIcon className="w-4 h-4" /> <span>Total Kelas</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">{classes.length} <span className="text-sm font-normal text-slate-500">Kelas</span></div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
          <div className="text-slate-500 text-sm mb-1 font-medium flex items-center space-x-2">
            <Users className="w-4 h-4" /> <span>Total Siswa</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">{students.length} <span className="text-sm font-normal text-slate-500">Siswa</span></div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
          <div className="text-orange-600 text-sm mb-1 font-medium">MIJEL Bulan Ini</div>
          <div className="text-2xl font-bold text-orange-900">{totalMijel}</div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="text-green-600 text-sm mb-1 font-medium">Bank Sampah</div>
          <div className="text-2xl font-bold text-green-900">{totalBS}</div>
        </div>
      </div>

      <h3 className="font-semibold text-slate-800 mb-3">Menu Utama</h3>
      <div className="grid grid-cols-2 gap-3">
        <MenuCard icon={<CheckSquare className="text-blue-500" />} label="Input Kegiatan" onClick={() => navigate('/period')} />
        <MenuCard icon={<BarChart className="text-purple-500" />} label="Rekap Kegiatan" onClick={() => navigate('/recap-all')} />
        <MenuCard icon={<Download className="text-emerald-500" />} label="Download Laporan" onClick={() => navigate('/reports')} />
        <MenuCard icon={<HomeIcon className="text-teal-500" />} label="Data Kelas" onClick={() => navigate('/master-class')} />
        <MenuCard icon={<Users className="text-pink-500" />} label="Data Siswa" onClick={() => navigate('/master-student')} />
      </div>
    </div>
  );
}

function MenuCard({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="bg-white p-4 rounded-md shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-3 hover:bg-slate-50 transition-colors"
    >
      <div className="p-3 bg-slate-50 rounded-full">
        {icon}
      </div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </button>
  );
}
