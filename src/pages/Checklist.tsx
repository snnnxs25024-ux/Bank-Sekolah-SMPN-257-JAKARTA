import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Save, CheckCircle2, Check, Download } from 'lucide-react';
import { useStore } from '../store/useStore';
import { BankSchoolActivity } from '../lib/types';
import { cn } from '../lib/utils';

export default function Checklist() {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  const classes = useStore((state) => state.classes);
  const students = useStore((state) => state.students);
  const activities = useStore((state) => state.activities);
  const activePeriod = useStore((state) => state.activePeriod);
  const saveActivity = useStore((state) => state.saveActivity);

  const currentClass = classes.find(c => c.id === classId);
  const classStudents = students
    .filter(s => s.class_id === classId || (currentClass && s.class_id === currentClass.name))
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const [search, setSearch] = useState('');
  const [checklistData, setChecklistData] = useState<Record<string, { mijel: boolean, bank_sampah: boolean }>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!currentClass || !activePeriod) return;

    const initialData: Record<string, { mijel: boolean, bank_sampah: boolean }> = {};
    
    classStudents.forEach(student => {
      const studentActivity = activities.find(
        a => a.student_id === student.id && a.period_id === activePeriod.id
      );
      
      initialData[student.id] = {
        mijel: studentActivity?.mijel || false,
        bank_sampah: studentActivity?.bank_sampah || false,
      };
    });

    setChecklistData(initialData);
  }, [classId, activities, activePeriod, students]);

  if (!currentClass || !activePeriod) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p className="text-sm">Data kelas atau periode tidak ditemukan.</p>
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-xs font-semibold"
        >
          Kembali
        </button>
      </div>
    );
  }

  const filteredStudents = classStudents.filter(s => 
    (s.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (studentId: string, field: 'mijel' | 'bank_sampah') => {
    setChecklistData(prev => ({
      ...prev,
      [studentId]: {
        mijel: field === 'mijel' ? !(prev[studentId]?.mijel) : !!(prev[studentId]?.mijel),
        bank_sampah: field === 'bank_sampah' ? !(prev[studentId]?.bank_sampah) : !!(prev[studentId]?.bank_sampah),
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const newActivities: Partial<BankSchoolActivity>[] = classStudents.map(student => {
      const existing = activities.find(a => a.student_id === student.id && a.period_id === activePeriod.id);
      const data = checklistData[student.id] || { mijel: false, bank_sampah: false };
      return {
        ...(existing ? { id: existing.id } : {}),
        student_id: student.id,
        period_id: activePeriod.id,
        mijel: data.mijel,
        bank_sampah: data.bank_sampah,
        is_absent: false,
      };
    });
    
    await saveActivity(newActivities);
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 1800);
  };

  const totalMijel = Object.values(checklistData).filter(d => d.mijel).length;
  const totalBankSampah = Object.values(checklistData).filter(d => d.bank_sampah).length;

  return (
    <div className="h-[100dvh] flex flex-col bg-slate-50 overflow-hidden">
      {/* 1. Header Bagian Atas (Tetap / Fixed) */}
      <header className="flex-none bg-white border-b border-slate-200 px-4 pt-4 pb-3 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate(-1)} 
                className="w-10 h-10 -ml-1 bg-slate-100 rounded-full text-slate-700 hover:bg-slate-200 transition-colors flex items-center justify-center flex-shrink-0"
                title="Kembali"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Kegiatan Kelas {currentClass.name}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Periode: Bulan {activePeriod.month} / {activePeriod.year} • Tingkat {currentClass.grade}
                </p>
              </div>
            </div>

            {/* Indikator Rekap Singkat & Tombol Download */}
            <div className="flex items-center space-x-2 text-xs">
              <div className="hidden sm:flex items-center space-x-2">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded-md border border-blue-200">
                  Mijel: {totalMijel}/{classStudents.length}
                </span>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-md border border-emerald-200">
                  Bank Sampah: {totalBankSampah}/{classStudents.length}
                </span>
              </div>
              <button
                onClick={() => navigate(`/reports?classId=${currentClass.id}`)}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center space-x-1.5 font-bold transition shadow-xs"
                title="Download / Cetak Laporan Kelas"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span className="text-xs">Laporan</span>
              </button>
            </div>
          </div>

          {/* Kotak Pencarian */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Cari nama siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* 2. Area Tabel yang Dapat Di-Scroll (Freeze thead di top-0) */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-4xl mx-auto p-3 sm:p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse table-fixed">
              {/* THEAD FREEZE: Menempel tepat di bagian atas scroll container */}
              <thead className="sticky top-0 z-20 bg-slate-100 border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <tr className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-2 text-center w-12 sm:w-16 border-r border-slate-200">
                    NO
                  </th>
                  <th className="py-3 px-3 sm:px-4">
                    NAMA SISWA
                  </th>
                  <th className="py-3 px-2 text-center w-24 sm:w-32 border-l border-slate-200 bg-blue-50/70 text-blue-900">
                    MIJEL
                  </th>
                  <th className="py-3 px-2 text-center w-28 sm:w-36 border-l border-slate-200 bg-emerald-50/70 text-emerald-900">
                    BANK SAMPAH
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredStudents.map((student, index) => {
                  const data = checklistData[student.id] || { mijel: false, bank_sampah: false };
                  const isChecked = data.mijel || data.bank_sampah;

                  return (
                    <tr 
                      key={student.id} 
                      className={cn(
                        "transition-colors hover:bg-slate-50/80",
                        isChecked ? "bg-slate-50/40" : "bg-white"
                      )}
                    >
                      {/* Nomor Urut */}
                      <td className="py-3 px-2 text-center font-semibold text-slate-400 text-xs border-r border-slate-100">
                        {index + 1}
                      </td>

                      {/* Nama Siswa */}
                      <td className="py-3 px-3 sm:px-4 font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wide leading-snug">
                        {student.name}
                      </td>

                      {/* Kolom Checklist: Mijel */}
                      <td 
                        onClick={() => handleToggle(student.id, 'mijel')}
                        className="py-2.5 px-2 text-center border-l border-slate-100 cursor-pointer select-none"
                      >
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            aria-label={`Mijel ${student.name}`}
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-150",
                              data.mijel
                                ? "bg-blue-600 border-blue-600 text-white shadow-sm scale-105"
                                : "bg-white border-slate-300 text-transparent hover:border-blue-400"
                            )}
                          >
                            <Check className="w-5 h-5 stroke-[2.5]" />
                          </button>
                        </div>
                      </td>

                      {/* Kolom Checklist: Bank Sampah */}
                      <td 
                        onClick={() => handleToggle(student.id, 'bank_sampah')}
                        className="py-2.5 px-2 text-center border-l border-slate-100 cursor-pointer select-none"
                      >
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            aria-label={`Bank Sampah ${student.name}`}
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-150",
                              data.bank_sampah
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-sm scale-105"
                                : "bg-white border-slate-300 text-transparent hover:border-emerald-400"
                            )}
                          >
                            <Check className="w-5 h-5 stroke-[2.5]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 text-xs">
                      {search 
                        ? 'Tidak ada siswa yang cocok dengan kata pencarian.' 
                        : 'Belum ada data siswa di kelas ini.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 3. Tombol Simpan di Bawah (Tetap / Fixed) */}
      <footer className="flex-none bg-white border-t border-slate-200 p-3 sm:p-4 z-30 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="text-xs text-slate-600 hidden sm:block">
            <span className="font-semibold text-slate-800">{classStudents.length}</span> Total Siswa •{' '}
            <span className="text-blue-600 font-semibold">{totalMijel} Mijel</span> •{' '}
            <span className="text-emerald-600 font-semibold">{totalBankSampah} Bank Sampah</span>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto sm:min-w-[240px] ml-auto bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all flex justify-center items-center space-x-2 text-sm disabled:opacity-75"
          >
            <Save className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{isSaving ? 'MENYIMPAN...' : 'SIMPAN CHECKLIST'}</span>
          </button>
        </div>
      </footer>

      {/* Modal Notifikasi Berhasil Disimpan */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-200 max-w-sm w-full">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Berhasil Disimpan!</h3>
            <p className="text-xs text-slate-600">
              Checklist kegiatan kelas <span className="font-semibold text-slate-800">{currentClass.name}</span> berhasil diperbarui.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
