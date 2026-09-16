import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  ChevronLeft,
  FileText,
  Image as ImageIcon,
  Printer,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  exportToJPEGImage,
  exportToCSV,
  formatMonthName
} from '../lib/exportUtils';
import { formatClassName, reportFileBase } from '../lib/reportUtils';
import type { BankSchoolActivity, ClassData, Period, Student } from '../lib/types';

const HEADER_SRC = '/brand/bank-sampah-report-header.png';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener noreferrer';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 1000);
}

async function imageToDataUrl(src: string): Promise<string> {
  const response = await fetch(src);
  if (!response.ok) throw new Error(`Failed to load image: ${src}`);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function renderHeaderDataUrl(classHeader: string): Promise<string> {
  const image = await loadImage(await imageToDataUrl(HEADER_SRC));
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not supported');

  const scaleX = canvas.width / 2172;
  const scaleY = canvas.height / 724;
  const scale = Math.min(scaleX, scaleY);
  const centerX = 1335 * scaleX;
  const centerY = 463 * scaleY;
  const maskX = 1000 * scaleX;
  const maskY = 375 * scaleY;
  const maskWidth = 760 * scaleX;
  const maskHeight = 165 * scaleY;
  const lineY = 462 * scaleY;
  const lineHeight = 8 * scaleY;

  context.drawImage(image, 0, 0);
  context.fillStyle = '#ffffff';
  context.fillRect(maskX, maskY, maskWidth, maskHeight);

  let fontSize = 58 * scale;
  const maxTextWidth = maskWidth - (72 * scale);
  do {
    context.font = `900 ${fontSize}px Arial, sans-serif`;
    fontSize -= scale;
  } while (context.measureText(classHeader).width > maxTextWidth && fontSize > 24 * scale);

  const textWidth = context.measureText(classHeader).width;
  const lineGap = 42 * scale;
  context.fillStyle = '#f9b52f';
  context.fillRect(710 * scaleX, lineY, Math.max(0, centerX - (textWidth / 2) - lineGap - (710 * scaleX)), lineHeight);
  context.fillRect(centerX + (textWidth / 2) + lineGap, lineY, Math.max(0, 1975 * scaleX - centerX - (textWidth / 2) - lineGap), lineHeight);
  context.fillStyle = '#1c5a91';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(classHeader, centerX, centerY);

  return canvas.toDataURL('image/png');
}

function escapeHtml(value: string | number | undefined) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function classDisplayName(cls: ClassData) {
  return formatClassName(cls.name, cls.grade);
}

function classHeaderText(cls: ClassData) {
  return `KELAS ${classDisplayName(cls)}`;
}

function classStudentsFor(cls: ClassData, students: Student[]) {
  return students
    .filter((student) => student.class_id === cls.id || student.class_id === cls.name)
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

function activitiesForClass(period: Period, classStudents: Student[], activities: BankSchoolActivity[]) {
  const ids = new Set(classStudents.map((student) => student.id));
  return activities.filter((activity) => activity.period_id === period.id && ids.has(activity.student_id));
}

function activityForStudent(period: Period, activities: BankSchoolActivity[], studentId: string) {
  return activities.find((activity) => activity.student_id === studentId && activity.period_id === period.id);
}

function buildExcelHtml({
  activePeriod,
  monthName,
  targetClasses,
  students,
  activities,
  headerDataUrls,
}: {
  activePeriod: Period;
  monthName: string;
  targetClasses: ClassData[];
  students: Student[];
  activities: BankSchoolActivity[];
  headerDataUrls: Record<string, string>;
}) {
  const sections = targetClasses.map((cls, classIndex) => {
    const classStudents = classStudentsFor(cls, students);
    const classActivities = activitiesForClass(activePeriod, classStudents, activities);
    const totalMijel = classActivities.filter((activity) => activity.mijel).length;
    const totalBS = classActivities.filter((activity) => activity.bank_sampah).length;
    const rows = classStudents.map((student, index) => {
      const activity = activityForStudent(activePeriod, activities, student.id);

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(student.name.toUpperCase())}</td>
          <td>${activity?.mijel ? '✓' : '-'}</td>
          <td>${activity?.bank_sampah ? '✓' : '-'}</td>
        </tr>
      `;
    }).join('');

    return `
      ${classIndex > 0 ? '<br style="page-break-before: always" />' : ''}
      <table class="header">
        <tr><td colspan="4"><img src="${headerDataUrls[cls.id]}" width="760" /></td></tr>
      </table>
      <table class="meta">
        <tr><td>Bulan</td><td>${escapeHtml(monthName)} ${activePeriod.year}</td><td>Total Siswa</td><td>${classStudents.length}</td></tr>
        <tr><td>MIJEL</td><td>${totalMijel}</td><td>Bank Sampah</td><td>${totalBS}</td></tr>
      </table>
      <table class="data">
        <thead>
          <tr><th>NO</th><th>NAMA</th><th>MIJEL</th><th>BS</th></tr>
        </thead>
        <tbody>
          ${rows || `<tr><td colspan="4">Belum ada siswa terdaftar di kelas ${escapeHtml(classDisplayName(cls))}.</td></tr>`}
        </tbody>
      </table>
    `;
  }).join('');

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; color: #102a56; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 14px; }
          .header td { border: 0; text-align: center; }
          .meta td { border: 1px solid #ccd8e7; padding: 8px; font-weight: 700; }
          .data th { background: #102a56; color: #ffffff; border: 1px solid #102a56; padding: 8px; }
          .data td { border: 1px solid #222222; padding: 7px; }
        </style>
      </head>
      <body>${sections}</body>
    </html>
  `;
}

async function exportReportToPDF(element: HTMLElement, fileName: string) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });
  const image = canvas.toDataURL('image/jpeg', 0.98);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageHeight = (canvas.height * pageWidth) / canvas.width;
  let heightLeft = imageHeight;
  let position = 0;

  pdf.addImage(image, 'JPEG', 0, position, pageWidth, imageHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imageHeight;
    pdf.addPage();
    pdf.addImage(image, 'JPEG', 0, position, pageWidth, imageHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(fileName);
}

export default function Reports() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { classes, activePeriod, students, activities } = useStore();
  const initialClassId = searchParams.get('classId') || (classes[0]?.id || 'all');
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [headerDataUrls, setHeaderDataUrls] = useState<Record<string, string>>({});
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cid = searchParams.get('classId');
    if (cid && (cid === 'all' || classes.some((cls) => cls.id === cid))) {
      setSelectedClassId(cid);
    }
  }, [searchParams, classes]);

  const monthName = activePeriod ? formatMonthName(activePeriod.month) : '';
  const isAll = selectedClassId === 'all';
  const targetClasses = isAll ? classes : classes.filter((cls) => cls.id === selectedClassId);
  const selectedClassLabel = isAll ? 'Semua Kelas' : (targetClasses[0] ? classDisplayName(targetClasses[0]) : 'Kelas');
  const fileBase = activePeriod ? reportFileBase(monthName, activePeriod.year, selectedClassLabel) : 'Laporan_Bank_Sampah';
  const targetClassKey = targetClasses.map((cls) => `${cls.id}:${cls.name}:${cls.grade}`).join('|');

  useEffect(() => {
    let isCurrent = true;
    setHeaderDataUrls({});

    Promise.all(
      targetClasses.map((cls) => renderHeaderDataUrl(classHeaderText(cls)).then((dataUrl) => [cls.id, dataUrl] as const))
    )
      .then((entries) => {
        if (isCurrent) setHeaderDataUrls(Object.fromEntries(entries));
      })
      .catch((error) => {
        console.error('Failed to render report header:', error);
        if (isCurrent) setErrorMessage('Header laporan gagal dimuat.');
      });

    return () => {
      isCurrent = false;
    };
  }, [targetClassKey]);

  const headersReady = targetClasses.length === 0 || targetClasses.every((cls) => Boolean(headerDataUrls[cls.id]));

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => {
      setErrorMessage(null);
    }, 4000);
  };

  if (!activePeriod) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p className="text-sm">Tidak ada periode aktif yang dipilih.</p>
        <button
          onClick={() => navigate('/period')}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-xs font-semibold shadow-sm"
        >
          Pilih Periode
        </button>
      </div>
    );
  }

  const handleDownloadExcel = () => {
    if (!headersReady) return;
    setIsGenerating('excel');
    try {
      const html = buildExcelHtml({
        activePeriod,
        monthName,
        targetClasses,
        students,
        activities,
        headerDataUrls,
      });
      downloadBlob(new Blob([`\ufeff${html}`], { type: 'application/vnd.ms-excel;charset=utf-8;' }), `${fileBase}.xls`);
      showToast('File Excel berhasil diunduh!');
    } catch (err) {
      console.error('Failed to export Excel:', err);
      showError('Gagal mengunduh Excel. Silakan coba kembali.');
    } finally {
      setIsGenerating(null);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current || !headersReady) return;
    setIsGenerating('pdf');
    try {
      await exportReportToPDF(reportRef.current, `${fileBase}.pdf`);
      showToast('File PDF berhasil diunduh!');
    } catch (err) {
      console.error('Failed to export PDF:', err);
      showError('Gagal mengunduh PDF. Silakan gunakan opsi Cetak/Print.');
    } finally {
      setIsGenerating(null);
    }
  };

  const handleDownloadJPEG = async () => {
    if (!reportRef.current || !headersReady) return;
    setIsGenerating('jpeg');
    try {
      await exportToJPEGImage(reportRef.current, `${fileBase}.jpg`);
      showToast('File Gambar JPG berhasil diunduh!');
    } catch (err) {
      console.error('Failed to generate JPG:', err);
      showError('Gagal membuat gambar JPG. Silakan gunakan opsi PDF atau Cetak.');
    } finally {
      setIsGenerating(null);
    }
  };

  const handleDownloadCSV = () => {
    setIsGenerating('csv');
    try {
      exportToCSV({
        classes,
        students,
        activities,
        period: activePeriod,
        selectedClassId,
      });
      showToast('File CSV berhasil diunduh!');
    } catch (err) {
      console.error('Failed to export CSV:', err);
      showError('Gagal mengunduh CSV.');
    } finally {
      setIsGenerating(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 pb-24">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-5 right-5 z-50 bg-red-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-3 duration-200">
          <AlertCircle className="w-4 h-4 text-white flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

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
            <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              Download & Cetak Laporan
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Format resmi Bank Sampah Sekolah SMPN 257 Jakarta
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <div className="mb-4">
            <label htmlFor="select-class" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Pilih Target Laporan
            </label>
            <select
              id="select-class"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
            >
              {classes.length > 0 && <option value="all">Semua Kelas (Cetak & Unduh Sekaligus)</option>}
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  Kelas {classDisplayName(cls)} (Tingkat {cls.grade})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Opsi Download & Cetak:
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={handleDownloadExcel}
                disabled={!!isGenerating || !headersReady}
                className="bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 text-xs shadow-xs transition disabled:opacity-60"
                title="Download spreadsheet Excel"
              >
                {isGenerating === 'excel' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                <span>{isGenerating === 'excel' ? 'Memproses...' : 'Unduh Excel'}</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={!!isGenerating || !headersReady}
                className="bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 text-xs shadow-xs transition disabled:opacity-60"
                title="Download dokumen PDF resmi"
              >
                {isGenerating === 'pdf' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                <span>{isGenerating === 'pdf' ? 'Memproses...' : 'Unduh PDF'}</span>
              </button>

              <button
                onClick={handleDownloadJPEG}
                disabled={!!isGenerating || !headersReady}
                className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 text-xs shadow-xs transition disabled:opacity-60"
                title="Download gambar resolusi tinggi JPG"
              >
                {isGenerating === 'jpeg' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
                <span>{isGenerating === 'jpeg' ? 'Memproses...' : 'Unduh JPEG'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 text-xs shadow-xs transition"
                title="Cetak langsung menggunakan printer / print to PDF"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Print</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleDownloadCSV}
                disabled={!!isGenerating}
                className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-slate-100 transition"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Format CSV alternatif</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto overflow-x-auto print:overflow-visible" data-report-root>
        <div
          ref={reportRef}
          className="bg-white text-black p-3 sm:p-10 rounded-2xl shadow-md border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full"
        >
          {targetClasses.map((cls, classIndex) => {
            const classStudents = classStudentsFor(cls, students);
            const classActivities = activitiesForClass(activePeriod, classStudents, activities);
            const mijelCount = classActivities.filter((activity) => activity.mijel).length;
            const bsCount = classActivities.filter((activity) => activity.bank_sampah).length;

            return (
              <div
                key={cls.id}
                className={classIndex > 0 ? 'mt-12 pt-8 border-t border-slate-200 print:break-before-page' : ''}
              >
                {headerDataUrls[cls.id] ? (
                  <img
                    src={headerDataUrls[cls.id]}
                    alt={`Header laporan ${classHeaderText(cls)}`}
                    className="mb-4 block w-full max-w-full h-auto object-contain"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="mb-4 flex h-48 items-center justify-center rounded-xl bg-slate-50 text-xs font-semibold text-slate-500">
                    Menyiapkan header laporan...
                  </div>
                )}

                <div className="mb-4 text-xs sm:text-sm font-bold text-slate-900">
                  Bulan: {monthName} {activePeriod.year}
                </div>

                <table className="w-full border-collapse border border-black text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-black font-bold uppercase">
                      <th className="border border-black py-2 px-2 text-center w-12">NO</th>
                      <th className="border border-black py-2 px-3 text-left">NAMA</th>
                      <th className="border border-black py-2 px-2 text-center w-20 sm:w-24">MIJEL</th>
                      <th className="border border-black py-2 px-2 text-center w-20 sm:w-24">BS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map((student, idx) => {
                      const act = activityForStudent(activePeriod, activities, student.id);
                      const isMijel = !!act?.mijel;
                      const isBS = !!act?.bank_sampah;

                      return (
                        <tr key={student.id} className="text-slate-900">
                          <td className="border border-black py-1.5 px-2 text-center font-medium">
                            {idx + 1}
                          </td>
                          <td className="border border-black py-1.5 px-3 font-semibold uppercase">
                            {student.name}
                          </td>
                          <td className="border border-black py-1.5 px-2 text-center font-bold">
                            {isMijel ? (
                              <span className="text-black font-black text-sm">✓</span>
                            ) : (
                              <span className="text-slate-400 font-normal">-</span>
                            )}
                          </td>
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
                          Belum ada siswa terdaftar di kelas {classDisplayName(cls)}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div className="mt-6 flex justify-between items-end text-xs text-slate-800">
                  <div>
                    <p className="font-medium">
                      Total Siswa: <span className="font-bold">{classStudents.length}</span>
                    </p>
                    <p className="font-medium">
                      Partisipasi: <span className="font-bold">Mijel: {mijelCount}</span> • <span className="font-bold">BS: {bsCount}</span>
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
