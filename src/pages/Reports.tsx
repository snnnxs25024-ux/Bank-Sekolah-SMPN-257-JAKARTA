import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ChevronLeft, FileText, Image as ImageIcon, Printer, Check, Minus } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const INDONESIAN_MONTHS = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function formatMonth(month: number | string): string {
  const m = Number(month);
  if (!isNaN(m) && m >= 1 && m <= 12) {
    return INDONESIAN_MONTHS[m];
  }
  return String(month);
}

export default function Reports() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { classes, activePeriod, students, activities } = useStore();
  
  const initialClassId = searchParams.get('classId') || (classes[0]?.id || 'all');
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId);
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cid = searchParams.get('classId');
    if (cid && classes.some(c => c.id === cid)) {
      setSelectedClassId(cid);
    }
  }, [searchParams, classes]);

  if (!activePeriod) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p className="text-sm">Tidak ada periode aktif yang dipilih.</p>
        <button 
          onClick={() => navigate('/period')}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-xs font-semibold"
        >
          Pilih Periode
        </button>
      </div>
    );
  }

  const monthName = formatMonth(activePeriod.month);
  const isAll = selectedClassId === 'all';
  const targetClasses = isAll ? classes : classes.filter(c => c.id === selectedClassId);

  // Download high-resolution PNG image
  const handleDownloadPNG = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const link = document.createElement('a');
      const classNameClean = isAll ? 'Semua_Kelas' : (classes.find(c => c.id === selectedClassId)?.name || 'Kelas').replace(/\s+/g, '_');
      link.download = `Laporan_Bank_Sampah_${classNameClean}_${monthName}_${activePeriod.year}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      console.error('Failed to generate PNG:', err);
      alert('Gagal membuat file gambar. Silakan gunakan opsi Cetak/PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Download PDF file
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const classNameClean = isAll ? 'Semua_Kelas' : (classes.find(c => c.id === selectedClassId)?.name || 'Kelas').replace(/\s+/g, '_');
      pdf.save(`Laporan_Bank_Sampah_${classNameClean}_${monthName}_${activePeriod.year}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  // Direct print via browser
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 pb-24">
      {/* Navigation & Control Panel (Screen only, hidden on print) */}
      <div className="max-w-3xl mx-auto print:hidden">
        <div className="flex items-center space-x-3 mb-5">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 bg-white rounded-full text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
            title="Kembali"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              Download & Cetak Laporan
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Format resmi Bank Sampah Sekolah SMPN 257 Jakarta
            </p>
          </div>
        </div>

        {/* Selection and Action Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <div className="mb-4">
            <label htmlFor="select-class" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Pilih Kelas
            </label>
            <select
              id="select-class"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
            >
              {classes.length > 1 && <option value="all">Semua Kelas (Cetak Sekaligus)</option>}
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  Kelas {c.name} (Tingkat {c.grade})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 text-xs sm:text-sm shadow-sm transition disabled:opacity-60"
            >
              <FileText className="w-4 h-4" />
              <span>{isGenerating ? 'Memproses...' : 'Unduh PDF'}</span>
            </button>

            <button
              onClick={handleDownloadPNG}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 text-xs sm:text-sm shadow-sm transition disabled:opacity-60"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{isGenerating ? 'Memproses...' : 'Unduh Gambar'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 text-xs sm:text-sm shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Report Document Area (A4 printable & downloadable preview) */}
      <div className="max-w-3xl mx-auto">
        <div 
          ref={reportRef} 
          className="bg-white text-black p-8 sm:p-10 rounded-2xl shadow-md border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full"
        >
          {targetClasses.map((cls, classIndex) => {
            const classStudents = students
              .filter(s => s.class_id === cls.id || s.class_id === cls.name)
              .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

            return (
              <div 
                key={cls.id} 
                className={classIndex > 0 ? "mt-12 pt-8 border-t border-slate-200 print:break-before-page" : ""}
              >
                {/* 1. KOP LAPORAN */}
                {/* Logo di kiri, samping nya tulisan BANK SAMPAH SEKOLAH, SMPN 257 JAKARTA, di bawah nya kelas nya */}
                <div className="flex items-center space-x-4 mb-3">
                  {/* Logo SMPN 257 Jakarta */}
                  <img 
                    src="/brand/smpn-257-logo.png" 
                    alt="Logo SMPN 257 Jakarta" 
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain flex-shrink-0"
                  />
                  {/* Teks Samping Logo */}
                  <div className="flex-1">
                    <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-950 uppercase leading-none">
                      BANK SAMPAH SEKOLAH
                    </h1>
                    <h2 className="text-sm sm:text-base font-extrabold tracking-wide text-[#b77808] uppercase mt-1 leading-tight">
                      SMPN 257 JAKARTA
                    </h2>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                      Kelas: {cls.name}
                    </p>
                  </div>
                </div>

                {/* 2. GARIS PANJANG */}
                <div className="w-full border-b-[2.5px] border-black my-2.5" />

                {/* 3. ADA BULAN NYA */}
                <div className="mb-4 text-xs sm:text-sm font-bold text-slate-900">
                  Bulan: {monthName} {activePeriod.year}
                </div>

                {/* 4. TABEL NO, NAMA, MIJEL, BS */}
                <table className="w-full border-collapse border border-black text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-black font-bold uppercase">
                      <th className="border border-black py-2 px-2 text-center w-12">
                        NO
                      </th>
                      <th className="border border-black py-2 px-3 text-left">
                        NAMA
                      </th>
                      <th className="border border-black py-2 px-2 text-center w-20 sm:w-24">
                        MIJEL
                      </th>
                      <th className="border border-black py-2 px-2 text-center w-20 sm:w-24">
                        BS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map((student, idx) => {
                      const act = activities.find(
                        a => a.student_id === student.id && a.period_id === activePeriod.id
                      );
                      const isMijel = !!act?.mijel;
                      const isBS = !!act?.bank_sampah;

                      return (
                        <tr key={student.id} className="text-slate-900">
                          {/* NO */}
                          <td className="border border-black py-1.5 px-2 text-center font-medium">
                            {idx + 1}
                          </td>

                          {/* NAMA */}
                          <td className="border border-black py-1.5 px-3 font-semibold uppercase">
                            {student.name}
                          </td>

                          {/* MIJEL */}
                          <td className="border border-black py-1.5 px-2 text-center font-bold">
                            {isMijel ? (
                              <span className="text-black font-black text-sm">✓</span>
                            ) : (
                              <span className="text-slate-400 font-normal">-</span>
                            )}
                          </td>

                          {/* BS */}
                          <td className="border border-black py-1.5 px-2 text-center font-bold">
                            {isBS ? (
                              <span className="text-black font-black text-sm">✓</span>
                            ) : (
                              <span className="text-slate-400 font-normal">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {classStudents.length === 0 && (
                      <tr>
                        <td colSpan={4} className="border border-black py-6 text-center text-slate-500 italic text-xs">
                          Belum ada siswa terdaftar di kelas {cls.name}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Ringkasan & Tanda Tangan */}
                <div className="mt-6 flex justify-between items-end text-xs text-slate-800">
                  <div>
                    <p className="font-medium">
                      Total Siswa: <span className="font-bold">{classStudents.length}</span>
                    </p>
                    <p className="font-medium">
                      Partisipasi: <span className="font-bold">Mijel: {classStudents.filter(s => activities.some(a => a.student_id === s.id && a.period_id === activePeriod.id && a.mijel)).length}</span> • <span className="font-bold">BS: {classStudents.filter(s => activities.some(a => a.student_id === s.id && a.period_id === activePeriod.id && a.bank_sampah)).length}</span>
                    </p>
                  </div>

                  <div className="text-center min-w-[140px]">
                    <p className="mb-14">Petugas / Koordinator</p>
                    <p className="border-t border-black font-bold pt-1">
                      ( ..................................... )
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          nav, header, footer, .print\\:hidden {
            display: none !important;
          }
          .print\\:break-before-page {
            page-break-before: always;
            break-before: page;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
}
