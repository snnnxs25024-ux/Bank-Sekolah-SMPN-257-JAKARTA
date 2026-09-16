import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ChevronLeft, Download, Check, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { exportToExcel, exportToVectorPDF, formatMonthName } from '../lib/exportUtils';

export default function RecapClass() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { classes, students, activities, activePeriod } = useStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const currentClass = classes.find(c => c.id === classId);

  if (!currentClass || !activePeriod) return <div className="p-4">Data tidak ditemukan</div>;

  const monthName = formatMonthName(activePeriod.month);

  const classStudents = students
    .filter(s => s.class_id === classId || (currentClass && s.class_id === currentClass.name))
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  
  const classStudentIds = new Set(classStudents.map(s => s.id));
  const classActivities = activities.filter(a => a.period_id === activePeriod.id && classStudentIds.has(a.student_id));

  const totalMijel = classActivities.filter(a => a.mijel).length;
  const totalBS = classActivities.filter(a => a.bank_sampah).length;

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
        selectedClassId: currentClass.id,
      });
      showToast(`Excel Kelas ${currentClass.name} berhasil diunduh!`);
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
        selectedClassId: currentClass.id,
      });
      showToast(`PDF Kelas ${currentClass.name} berhasil diunduh!`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 pb-20">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-white px-4 py-4 border-b border-slate-100 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Rekap Kelas {currentClass.name}</h1>
              <p className="text-xs text-slate-500 font-medium">Periode: Bulan {monthName} {activePeriod.year}</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleQuickExcel}
              disabled={!!isExporting}
              className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition shadow-xs"
              title="Download Excel Kelas Ini"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
            <button
              onClick={handleQuickPDF}
              disabled={!!isExporting}
              className="p-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl transition shadow-xs"
              title="Download PDF Kelas Ini"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(`/reports?classId=${currentClass.id}`)}
              className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
              title="Buka Halaman Download Lengkap"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Laporan Lengkap</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatBox label="Total Siswa" value={classStudents.length} color="bg-slate-100 text-slate-800" />
          <StatBox label="Mijel" value={`${totalMijel} Siswa`} color="bg-blue-50 text-blue-800 border border-blue-100" />
          <StatBox label="Bank Sampah" value={`${totalBS} Siswa`} color="bg-emerald-50 text-emerald-800 border border-emerald-100" />
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-[40px_1fr_70px_70px] bg-slate-100 border-b border-slate-200 p-3 text-xs font-bold text-slate-700 uppercase sticky top-0 z-10 shadow-xs">
            <div className="text-center">No</div>
            <div>Nama Siswa</div>
            <div className="text-center text-blue-800">Mijel</div>
            <div className="text-center text-emerald-800">BS</div>
          </div>
          
          <div className="divide-y divide-slate-100 text-sm">
            {classStudents.map((student, index) => {
              const act = classActivities.find(a => a.student_id === student.id);
              const isMijel = !!act?.mijel;
              const isBS = !!act?.bank_sampah;

              return (
                <div 
                  key={student.id} 
                  className={cn("w-full grid grid-cols-[40px_1fr_70px_70px] p-3 items-center transition-colors", (isMijel || isBS) ? "bg-slate-50/40" : "bg-white")}
                >
                  <div className="text-xs text-slate-400 text-center font-medium">
                    {index + 1}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-800 pr-2 truncate uppercase">
                    {student.name}
                  </div>
                  <div className="text-center">
                    {isMijel ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-100 text-blue-700 font-bold text-xs">
                        ✓
                      </span>
                    ) : (
                      <span className="text-slate-300 font-bold">-</span>
                    )}
                  </div>
                  <div className="text-center">
                    {isBS ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 font-bold text-xs">
                        ✓
                      </span>
                    ) : (
                      <span className="text-slate-300 font-bold">-</span>
                    )}
                  </div>
                </div>
              );
            })}

            {classStudents.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                Belum ada data siswa di kelas ini.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string, value: string | number, color: string }) {
  return (
    <div className={cn("p-2.5 rounded-xl text-center flex flex-col justify-center", color)}>
      <div className="text-sm font-bold leading-tight">{value}</div>
      <div className="text-[10px] uppercase font-semibold opacity-80 mt-0.5">{label}</div>
    </div>
  );
}
