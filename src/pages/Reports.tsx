import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ChevronLeft, FileText, Image as ImageIcon, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function Reports() {
  const navigate = useNavigate();
  const { classes, activePeriod, students, activities } = useStore();
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!activePeriod) return <div>No active period</div>;

  const handleDownloadJPEG = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const image = canvas.toDataURL('image/jpeg', 1.0);
      const link = document.createElement('a');
      link.download = `Laporan_Bank_Sekolah_${activePeriod.month}_${activePeriod.year}.jpg`;
      link.href = image;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    // For a real app, use jsPDF or server-side generation.
    // For this prototype, we'll use standard window.print() which acts as a PDF saver.
    window.print();
  };

  const isAll = selectedClassId === 'all';
  const targetClass = isAll ? null : classes.find(c => c.id === selectedClassId);
  const targetStudents = isAll ? students : students.filter(s => s.class_id === selectedClassId);
  const targetActivities = activities.filter(a => a.period_id === activePeriod.id && (isAll || a.class_id === selectedClassId));
  
  const totalMijel = targetActivities.filter(a => a.mijel).length;
  const totalBS = targetActivities.filter(a => a.bank_sampah).length;

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6 print:hidden">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 bg-slate-100 rounded-full text-slate-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Download Laporan</h1>
      </div>

      <div className="bg-white p-5 rounded-md border border-slate-200 mb-6 print:hidden">
        <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Laporan</label>
        <select 
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 mb-4"
        >
          <option value="all">Seluruh Kelas</option>
          {classes.map(c => <option key={c.id} value={c.id}>Kelas {c.class_name}</option>)}
        </select>

        <div className="flex space-x-3">
          <button 
            onClick={handleDownloadPDF}
            className="flex-1 bg-red-50 text-red-600 border border-red-200 font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-red-100"
          >
            <FileText className="w-5 h-5" />
            <span>PDF</span>
          </button>
          <button 
            onClick={handleDownloadJPEG}
            disabled={isGenerating}
            className="flex-1 bg-blue-50 text-blue-600 border border-blue-200 font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-100"
          >
            <ImageIcon className="w-5 h-5" />
            <span>{isGenerating ? 'Loading...' : 'JPEG'}</span>
          </button>
        </div>
      </div>

      {/* Hidden printable/capturable area */}
      <div className="print:block" ref={reportRef}>
        <div className="bg-white p-8 max-w-2xl mx-auto border border-slate-200 print:border-none print:p-0">
          <div className="text-center mb-8 border-b-2 border-slate-800 pb-4">
            <h1 className="text-2xl font-bold text-slate-900 uppercase">Bank Sekolah</h1>
            <h2 className="text-lg font-bold text-slate-700">Laporan Kegiatan</h2>
            <p className="text-sm text-slate-600 mt-2">Periode: {activePeriod.month} {activePeriod.year}</p>
            <p className="text-sm text-slate-600">Kelas: {isAll ? 'Seluruh Kelas' : targetClass?.class_name}</p>
            {!isAll && targetClass && <p className="text-sm text-slate-600">Wali Kelas: {targetClass.teacher_name}</p>}
          </div>

          <div className="flex justify-around mb-8 bg-slate-100 p-4 rounded-md">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800">{targetStudents.length}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase">Total Siswa</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{totalMijel}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase">MIJEL</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{totalBS}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase">Bank Sampah</div>
            </div>
          </div>

          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 p-2 text-center w-12">No</th>
                <th className="border border-slate-300 p-2">Nama Siswa</th>
                {!isAll && <th className="border border-slate-300 p-2 text-center w-20">MIJEL</th>}
                {!isAll && <th className="border border-slate-300 p-2 text-center w-20">BS</th>}
                {isAll && <th className="border border-slate-300 p-2">Kelas</th>}
              </tr>
            </thead>
            <tbody>
              {targetStudents.slice(0, 30).map((student, idx) => {
                const act = targetActivities.find(a => a.student_id === student.id);
                return (
                  <tr key={student.id}>
                    <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-300 p-2">{student.student_name}</td>
                    {!isAll && (
                      <>
                        <td className="border border-slate-300 p-2 text-center font-bold text-orange-500">{act?.mijel ? '✓' : ''}</td>
                        <td className="border border-slate-300 p-2 text-center font-bold text-green-500">{act?.bank_sampah ? '✓' : ''}</td>
                      </>
                    )}
                    {isAll && (
                      <td className="border border-slate-300 p-2">{classes.find(c => c.id === student.class_id)?.class_name}</td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
          {targetStudents.length > 30 && (
            <div className="text-center text-xs text-slate-500 mt-2">
              ... dan {targetStudents.length - 30} siswa lainnya (Dipotong untuk preview)
            </div>
          )}

          <div className="mt-16 flex justify-between px-8">
            <div className="text-center">
              <p className="mb-16 text-sm">Petugas Bank Sekolah</p>
              <p className="border-t border-slate-800 pt-2 text-sm font-bold w-40 mx-auto">Tanda Tangan</p>
            </div>
            {!isAll && targetClass && (
              <div className="text-center">
                <p className="mb-16 text-sm">Wali Kelas</p>
                <p className="border-t border-slate-800 pt-2 text-sm font-bold w-40 mx-auto">{targetClass.teacher_name}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:block, .print\\:block * { visibility: visible; }
          .print\\:block { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
