import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Calendar, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Period } from '../lib/types';

const MONTH_NAMES = [
  { num: 1, name: 'Januari' },
  { num: 2, name: 'Februari' },
  { num: 3, name: 'Maret' },
  { num: 4, name: 'April' },
  { num: 5, name: 'Mei' },
  { num: 6, name: 'Juni' },
  { num: 7, name: 'Juli' },
  { num: 8, name: 'Agustus' },
  { num: 9, name: 'September' },
  { num: 10, name: 'Oktober' },
  { num: 11, name: 'November' },
  { num: 12, name: 'Desember' }
];
const YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

export default function PeriodSelection() {
  const navigate = useNavigate();
  const { activePeriod, setActivePeriod, periods } = useStore();
  
  // Get initial month number
  const getInitialMonth = () => {
    if (!activePeriod) return 9;
    if (typeof activePeriod.month === 'number') return activePeriod.month;
    const found = MONTH_NAMES.find(m => m.name.toLowerCase() === String(activePeriod.month).toLowerCase());
    return found ? found.num : 9;
  };

  const [selectedMonthNum, setSelectedMonthNum] = useState<number>(getInitialMonth());
  const [selectedYear, setSelectedYear] = useState<number>(activePeriod?.year || 2026);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      // Find matching period in store
      let period = periods.find(p => {
        const pMonthNum = typeof p.month === 'number' 
          ? p.month 
          : MONTH_NAMES.find(m => m.name.toLowerCase() === String(p.month).toLowerCase())?.num;
        return pMonthNum === selectedMonthNum && p.year === selectedYear;
      });

      if (!period) {
        // Try creating in Supabase
        const payload = {
          month: selectedMonthNum,
          year: selectedYear,
          is_active: true
        };

        const { data, error } = await supabase.from('periods').insert([payload]).select().single();
        if (!error && data) {
          period = data as Period;
        } else {
          period = {
            id: `p-${Date.now()}`,
            month: selectedMonthNum,
            year: selectedYear,
            is_active: true
          };
        }
      }

      setActivePeriod(period);
      navigate('/classes');
    } catch {
      const fallbackPeriod: Period = {
        id: `p-${Date.now()}`,
        month: selectedMonthNum,
        year: selectedYear,
        is_active: true
      };
      setActivePeriod(fallbackPeriod);
      navigate('/classes');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Pilih Periode</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Periode Kegiatan</h2>
            <p className="text-xs text-slate-500">Tentukan bulan pendataan Bank Sekolah (Tersinkronisasi Supabase)</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Bulan</label>
            <select 
              value={selectedMonthNum}
              onChange={(e) => setSelectedMonthNum(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium"
            >
              {MONTH_NAMES.map(m => (
                <option key={m.num} value={m.num}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Tahun</label>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium"
            >
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={handleContinue}
        disabled={isSubmitting}
        className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/20 disabled:opacity-50"
      >
        {isSubmitting ? 'Menyambungkan...' : 'LANJUTKAN'}
      </button>
    </div>
  );
}

