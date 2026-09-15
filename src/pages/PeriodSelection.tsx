import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Calendar, ChevronLeft } from 'lucide-react';

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const YEARS = [2025, 2026, 2027, 2028, 2029];

export default function PeriodSelection() {
  const navigate = useNavigate();
  const { activePeriod, setActivePeriod, periods } = useStore();
  
  const [selectedMonth, setSelectedMonth] = useState(activePeriod?.month || 'September');
  const [selectedYear, setSelectedYear] = useState(activePeriod?.year || 2026);

  const handleContinue = () => {
    // Find or create period
    let period = periods.find(p => p.month === selectedMonth && p.year === selectedYear);
    if (!period) {
      // In a real app we'd add it to store/DB
      period = { id: `p-${Date.now()}`, month: selectedMonth, year: selectedYear };
    }
    setActivePeriod(period);
    navigate('/classes');
  };

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 bg-slate-100 rounded-full text-slate-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Pilih Periode</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-3 bg-primary-50 text-primary-600 rounded-md">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Periode Kegiatan</h2>
            <p className="text-xs text-slate-500">Tentukan bulan pendataan Bank Sekolah</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Bulan</label>
            <div className="relative">
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium"
              >
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tahun</label>
            <div className="relative">
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium"
              >
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleContinue}
        className="w-full bg-primary-600 text-white font-semibold py-4 rounded-md hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/20"
      >
        LANJUTKAN
      </button>
    </div>
  );
}
