import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { BarChart2, Download, ChevronRight, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';
import { exportToExcel, exportToVectorPDF, formatMonthName } from '../lib/exportUtils';

export default function RecapAll() {
  const navigate = useNavigate();
  const { classes, students, activities, activePeriod } = useStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  if (!activePeriod) return <div className="p-6">Tidak ada periode aktif</div>;

  const monthName = formatMonthName(activePeriod.month);
  const currentActivities = activities.filter(a => a.period_id === activePeriod.id);
  
  const totalSiswaAll = students.length;
  let totalMijelAll = 0;
  let totalBSAll = 0;

  const recapData = classes.map(c => {
    const classStudents = students.filter(s => s.class_id === c.id || s.class_id === c.name);
    const classStudentIds = new Set(classStudents.map(s => s.id));
    const classActivities = currentActivities.filter(a => classStudentIds.has(a.student_id));
    
    const mijelCount = classActivities.filter(a => a.mijel).length;
    const bsCount = classActivities.filter(a => a.bank_sampah).length;
    
    totalMijelAll += mijelCount;
    totalBSAll += bsCount;

    return {
      classId: c.id,
      className: c.name,
      totalSiswa: classStudents.length,
      mijelCount,
      bsCount,
    };
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleQuickExcel = () => {
    setIsExporting('excel');
    try {
      exportToExcel({
        classes,
        students,
        activities,
        period: activePeriod,
        selectedClassId: 'all',
      });
      showToast('Excel rekap semua kelas berhasil diunduh!');
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(null);
    }
  };

  const handleQuickPDF = async () => {
    setIsExporting('pdf');
    try {
      await exportToVectorPDF({
        classes,
        students,
        activities,
        period: activePeriod,
        selectedClassId: 'all',
      });
      showToast('PDF rekap semua kelas berhasil diunduh!');
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="p-6 pb-24">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">Rekap Keseluruhan</h1>
          <p className="text-xs text-slate-500 font-medium">Bulan: {monthName} • Tahun: {activePeriod.year}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleQuickExcel}
            disabled={!!isExporting}
            className="p-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition shadow-xs border border-emerald-200 flex items-center space-x-1"
            title="Download Excel Semua Kelas"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>
          <button 
            onClick={handleQuickPDF}
            disabled={!!isExporting}
            className="p-2.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl transition shadow-xs border border-red-200 flex items-center space-x-1"
            title="Download PDF Semua Kelas"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button 
            onClick={() => navigate('/reports')} 
            className="p-2.5 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-xl transition shadow-xs border border-primary-200"
            title="Buka Halaman Download Lengkap"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-800 text-white p-4 rounded-xl text-center shadow-sm col-span-2">
          <div className="text-2xl font-bold">{totalSiswaAll}</div>
          <div className="text-[10px] text-slate-300 uppercase tracking-wider mt-1">Total Siswa Terdaftar</div>
        </div>
        <div className="bg-blue-600 text-white p-4 rounded-xl text-center shadow-sm">
          <div className="text-2xl font-bold">{totalMijelAll}</div>
          <div className="text-[10px] text-blue-100 uppercase tracking-wider mt-1">Total Partisipasi Mijel</div>
        </div>
        <div className="bg-emerald-600 text-white p-4 rounded-xl text-center shadow-sm">
          <div className="text-2xl font-bold">{totalBSAll}</div>
          <div className="text-[10px] text-emerald-100 uppercase tracking-wider mt-1">Total Bank Sampah</div>
        </div>
      </div>

      <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
        <BarChart2 className="w-4 h-4 mr-2 text-slate-500" /> Rincian Per Kelas
      </h2>

      <div className="space-y-3">
        {recapData.sort((a,b) => a.className.localeCompare(b.className)).map((data) => (
          <button 
            key={data.classId}
            onClick={() => navigate(`/recap-class/${data.classId}`)}
            className="w-full bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex items-center justify-between hover:border-primary-400 transition-colors"
          >
            <div className="flex-1 text-left">
              <h3 className="text-base font-bold text-slate-800">Kelas {data.className}</h3>
              <div className="text-xs text-slate-500 mt-0.5">{data.totalSiswa} Siswa</div>
            </div>
            
            <div className="flex space-x-3 mr-4">
              <div className="text-right">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">MIJEL</div>
                <div className="text-sm font-bold text-blue-600">{data.mijelCount}</div>
              </div>
              <div className="w-px bg-slate-200"></div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">BS</div>
                <div className="text-sm font-bold text-emerald-600">{data.bsCount}</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        ))}
      </div>
    </div>
  );
}

