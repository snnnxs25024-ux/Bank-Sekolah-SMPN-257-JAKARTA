import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ClassData, Period, Student, BankSchoolActivity } from './types';

export const INDONESIAN_MONTHS = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function formatMonthName(month: number | string): string {
  const m = Number(month);
  if (!isNaN(m) && m >= 1 && m <= 12) {
    return INDONESIAN_MONTHS[m];
  }
  return String(month);
}

/**
 * Universal file download helper that works seamlessly inside iframes and across mobile browsers
 */
export function triggerFileDownload(blobOrUrl: Blob | string, filename: string) {
  try {
    const url = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      if (typeof blobOrUrl !== 'string') {
        URL.revokeObjectURL(url);
      }
    }, 1000);
  } catch (err) {
    console.error('triggerFileDownload error:', err);
    // Fallback: try opening in window
    if (typeof blobOrUrl === 'string') {
      window.open(blobOrUrl, '_blank');
    }
  }
}

/**
 * Loads an image from URL and converts it to Base64 data URL for safe jsPDF & html2canvas usage
 */
export async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('Could not load image as base64:', e);
    return null;
  }
}

/**
 * 1. EXPORT TO EXCEL (.xlsx)
 * Creates beautiful, clean Excel spreadsheets for single class or all classes
 */
export function exportToExcel({
  classes,
  students,
  activities,
  period,
  selectedClassId = 'all',
}: {
  classes: ClassData[];
  students: Student[];
  activities: BankSchoolActivity[];
  period: Period;
  selectedClassId?: string;
}) {
  const monthName = formatMonthName(period.month);
  const isAll = selectedClassId === 'all';
  const targetClasses = isAll ? classes : classes.filter(c => c.id === selectedClassId);

  const wb = XLSX.utils.book_new();

  // If "Semua Kelas", create a summary overview sheet first
  if (isAll && classes.length > 1) {
    const summaryRows: (string | number)[][] = [
      ['REKAPITULASI BANK SAMPAH SEKOLAH'],
      ['SMPN 257 JAKARTA'],
      [`Periode: Bulan ${monthName} ${period.year}`],
      [],
      ['NO', 'KELAS', 'TINGKAT', 'TOTAL SISWA', 'PARTISIPASI MIJEL', 'PARTISIPASI BANK SAMPAH', 'PERSENTASE MIJEL (%)', 'PERSENTASE BS (%)'],
    ];

    let totalAllStudents = 0;
    let totalAllMijel = 0;
    let totalAllBS = 0;

    targetClasses.forEach((cls, idx) => {
      const cStudents = students.filter(s => s.class_id === cls.id || s.class_id === cls.name);
      const cStudentIds = new Set(cStudents.map(s => s.id));
      const cActivities = activities.filter(a => a.period_id === period.id && cStudentIds.has(a.student_id));
      
      const mijelCount = cActivities.filter(a => a.mijel).length;
      const bsCount = cActivities.filter(a => a.bank_sampah).length;

      totalAllStudents += cStudents.length;
      totalAllMijel += mijelCount;
      totalAllBS += bsCount;

      const pctMijel = cStudents.length > 0 ? Math.round((mijelCount / cStudents.length) * 100) : 0;
      const pctBS = cStudents.length > 0 ? Math.round((bsCount / cStudents.length) * 100) : 0;

      summaryRows.push([
        idx + 1,
        cls.name,
        cls.grade,
        cStudents.length,
        mijelCount,
        bsCount,
        `${pctMijel}%`,
        `${pctBS}%`,
      ]);
    });

    // Total summary row
    const totalPctM = totalAllStudents > 0 ? Math.round((totalAllMijel / totalAllStudents) * 100) : 0;
    const totalPctBS = totalAllStudents > 0 ? Math.round((totalAllBS / totalAllStudents) * 100) : 0;

    summaryRows.push([]);
    summaryRows.push([
      '',
      'TOTAL KESELURUHAN',
      '',
      totalAllStudents,
      totalAllMijel,
      totalAllBS,
      `${totalPctM}%`,
      `${totalPctBS}%`,
    ]);

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows);
    summaryWs['!cols'] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 10 },
      { wch: 14 },
      { wch: 18 },
      { wch: 24 },
      { wch: 20 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Ringkasan Sekolah');
  }

  // Add sheet for each target class
  targetClasses.forEach((cls) => {
    const classStudents = students
      .filter(s => s.class_id === cls.id || s.class_id === cls.name)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const rows: (string | number)[][] = [
      ['BANK SAMPAH SEKOLAH'],
      ['SMPN 257 JAKARTA'],
      [`LAPORAN KEGIATAN KELAS: ${cls.name}`],
      [`Bulan: ${monthName} ${period.year}`],
      [],
      ['NO', 'NAMA SISWA', 'KELAS', 'MIJEL', 'BANK SAMPAH'],
    ];

    let mijelTotal = 0;
    let bsTotal = 0;

    classStudents.forEach((student, idx) => {
      const act = activities.find(a => a.student_id === student.id && a.period_id === period.id);
      const isMijel = !!act?.mijel;
      const isBS = !!act?.bank_sampah;

      if (isMijel) mijelTotal++;
      if (isBS) bsTotal++;

      rows.push([
        idx + 1,
        student.name.toUpperCase(),
        cls.name,
        isMijel ? '✓' : '-',
        isBS ? '✓' : '-',
      ]);
    });

    rows.push([]);
    rows.push(['', 'TOTAL SISWA', classStudents.length, '', '']);
    rows.push(['', 'TOTAL PARTISIPASI MIJEL', mijelTotal, '', '']);
    rows.push(['', 'TOTAL PARTISIPASI BANK SAMPAH', bsTotal, '', '']);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 34 },
      { wch: 14 },
      { wch: 12 },
      { wch: 16 },
    ];

    // Clean sheet name (max 31 chars, no invalid chars)
    const sheetName = `Kelas ${cls.name}`.replace(/[:\\/?*[\]]/g, '').substring(0, 30);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  const classNameClean = isAll ? 'Semua_Kelas' : (classes.find(c => c.id === selectedClassId)?.name || 'Kelas').replace(/\s+/g, '_');
  const fileName = `Laporan_Bank_Sampah_${classNameClean}_${monthName}_${period.year}.xlsx`;
  
  // Write and trigger download
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  triggerFileDownload(blob, fileName);
}

/**
 * 2. EXPORT TO CSV
 * Fast, universal CSV download with UTF-8 BOM
 */
export function exportToCSV({
  classes,
  students,
  activities,
  period,
  selectedClassId = 'all',
}: {
  classes: ClassData[];
  students: Student[];
  activities: BankSchoolActivity[];
  period: Period;
  selectedClassId?: string;
}) {
  const monthName = formatMonthName(period.month);
  const isAll = selectedClassId === 'all';
  const targetClasses = isAll ? classes : classes.filter(c => c.id === selectedClassId);

  let csv = '\uFEFF'; // UTF-8 BOM
  csv += `BANK SAMPAH SEKOLAH SMPN 257 JAKARTA\r\n`;
  csv += `Periode: Bulan ${monthName} ${period.year}\r\n\r\n`;
  csv += `NO,NAMA SISWA,KELAS,MIJEL,BANK SAMPAH\r\n`;

  let globalNo = 1;
  targetClasses.forEach((cls) => {
    const classStudents = students
      .filter(s => s.class_id === cls.id || s.class_id === cls.name)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    classStudents.forEach((student) => {
      const act = activities.find(a => a.student_id === student.id && a.period_id === period.id);
      const mijelStr = act?.mijel ? 'YA' : '-';
      const bsStr = act?.bank_sampah ? 'YA' : '-';
      const nameSafe = `"${student.name.replace(/"/g, '""')}"`;
      csv += `${globalNo++},${nameSafe},${cls.name},${mijelStr},${bsStr}\r\n`;
    });
  });

  const classNameClean = isAll ? 'Semua_Kelas' : (classes.find(c => c.id === selectedClassId)?.name || 'Kelas').replace(/\s+/g, '_');
  const fileName = `Laporan_Bank_Sampah_${classNameClean}_${monthName}_${period.year}.csv`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  triggerFileDownload(blob, fileName);
}

/**
 * 3. HIGH-PRECISION NATIVE VECTOR PDF EXPORT
 * Generates official crisp A4 PDF reports directly with jsPDF (no blur, 100% reliable, perfect pagination)
 */
export async function exportToVectorPDF({
  classes,
  students,
  activities,
  period,
  selectedClassId = 'all',
  logoBase64,
}: {
  classes: ClassData[];
  students: Student[];
  activities: BankSchoolActivity[];
  period: Period;
  selectedClassId?: string;
  logoBase64?: string | null;
}) {
  const monthName = formatMonthName(period.month);
  const isAll = selectedClassId === 'all';
  const targetClasses = isAll ? classes : classes.filter(c => c.id === selectedClassId);

  // If logo not supplied, try loading it
  let logo = logoBase64;
  if (!logo) {
    logo = await loadImageAsBase64('/brand/smpn-257-logo.png');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182mm

  targetClasses.forEach((cls, classIdx) => {
    if (classIdx > 0) {
      doc.addPage();
    }

    const classStudents = students
      .filter(s => s.class_id === cls.id || s.class_id === cls.name)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    let cursorY = 15;

    // KOP Header: Logo on left, text beside logo
    if (logo) {
      try {
        doc.addImage(logo, 'PNG', marginX, cursorY, 18, 18);
      } catch {
        // Continue if image add fails
      }
    }

    const headerTextX = logo ? marginX + 22 : marginX;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('BANK SAMPAH SEKOLAH', headerTextX, cursorY + 5);

    doc.setFontSize(12);
    doc.setTextColor(183, 120, 8); // #b77808 gold/amber
    doc.text('SMPN 257 JAKARTA', headerTextX, cursorY + 11);

    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(`Kelas: ${cls.name} (Tingkat ${cls.grade})`, headerTextX, cursorY + 16);

    cursorY += 21;

    // Black Divider Line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.6);
    doc.line(marginX, cursorY, marginX + contentWidth, cursorY);

    cursorY += 6;

    // Month info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Bulan: ${monthName} ${period.year}`, marginX, cursorY);

    cursorY += 5;

    // Table Column Widths (Total: 182mm)
    const colNoWidth = 14;
    const colMijelWidth = 26;
    const colBSWidth = 26;
    const colNameWidth = contentWidth - colNoWidth - colMijelWidth - colBSWidth; // 116mm

    const colNoX = marginX;
    const colNameX = colNoX + colNoWidth;
    const colMijelX = colNameX + colNameWidth;
    const colBSX = colMijelX + colMijelWidth;

    // Draw Table Header
    const headerHeight = 8;
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(marginX, cursorY, contentWidth, headerHeight, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);

    doc.text('NO', colNoX + colNoWidth / 2, cursorY + 5.5, { align: 'center' });
    doc.text('NAMA SISWA', colNameX + 3, cursorY + 5.5);
    doc.text('MIJEL', colMijelX + colMijelWidth / 2, cursorY + 5.5, { align: 'center' });
    doc.text('BS', colBSX + colBSWidth / 2, cursorY + 5.5, { align: 'center' });

    // Header vertical borders
    doc.line(colNameX, cursorY, colNameX, cursorY + headerHeight);
    doc.line(colMijelX, cursorY, colMijelX, cursorY + headerHeight);
    doc.line(colBSX, cursorY, colBSX, cursorY + headerHeight);

    cursorY += headerHeight;

    // Table Rows
    const rowHeight = 6.2;
    let mijelCount = 0;
    let bsCount = 0;

    classStudents.forEach((student, idx) => {
      // Check if row exceeds page height (leave room for summary and signature)
      if (cursorY + rowHeight > pageHeight - 38) {
        doc.addPage();
        cursorY = 16;
        
        // Redraw table header on new page
        doc.setFillColor(241, 245, 249);
        doc.rect(marginX, cursorY, contentWidth, headerHeight, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('NO', colNoX + colNoWidth / 2, cursorY + 5.5, { align: 'center' });
        doc.text(`NAMA SISWA (Kelas ${cls.name} - Lanjutan)`, colNameX + 3, cursorY + 5.5);
        doc.text('MIJEL', colMijelX + colMijelWidth / 2, cursorY + 5.5, { align: 'center' });
        doc.text('BS', colBSX + colBSWidth / 2, cursorY + 5.5, { align: 'center' });
        doc.line(colNameX, cursorY, colNameX, cursorY + headerHeight);
        doc.line(colMijelX, cursorY, colMijelX, cursorY + headerHeight);
        doc.line(colBSX, cursorY, colBSX, cursorY + headerHeight);
        cursorY += headerHeight;
      }

      const act = activities.find(a => a.student_id === student.id && a.period_id === period.id);
      const isMijel = !!act?.mijel;
      const isBS = !!act?.bank_sampah;

      if (isMijel) mijelCount++;
      if (isBS) bsCount++;

      // Row background
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252); // slate-50
        doc.rect(marginX, cursorY, contentWidth, rowHeight, 'F');
      }

      // Row outer borders
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.rect(marginX, cursorY, contentWidth, rowHeight, 'S');

      // Vertical separators
      doc.line(colNameX, cursorY, colNameX, cursorY + rowHeight);
      doc.line(colMijelX, cursorY, colMijelX, cursorY + rowHeight);
      doc.line(colBSX, cursorY, colBSX, cursorY + rowHeight);

      // Row Text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);

      // No
      doc.text(String(idx + 1), colNoX + colNoWidth / 2, cursorY + 4.3, { align: 'center' });

      // Name (truncate if too long)
      const studentNameUpper = student.name.toUpperCase();
      const truncatedName = doc.splitTextToSize(studentNameUpper, colNameWidth - 6)[0];
      doc.setFont('helvetica', 'bold');
      doc.text(truncatedName, colNameX + 3, cursorY + 4.3);

      // Mijel
      doc.setFont('helvetica', isMijel ? 'bold' : 'normal');
      doc.text(isMijel ? 'V' : '-', colMijelX + colMijelWidth / 2, cursorY + 4.3, { align: 'center' });

      // Bank Sampah
      doc.setFont('helvetica', isBS ? 'bold' : 'normal');
      doc.text(isBS ? 'V' : '-', colBSX + colBSWidth / 2, cursorY + 4.3, { align: 'center' });

      cursorY += rowHeight;
    });

    if (classStudents.length === 0) {
      doc.rect(marginX, cursorY, contentWidth, 10, 'S');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Belum ada siswa terdaftar di kelas ${cls.name}.`, marginX + contentWidth / 2, cursorY + 6.5, { align: 'center' });
      cursorY += 10;
    }

    // Summary and Signature Section
    cursorY += 6;
    if (cursorY > pageHeight - 34) {
      doc.addPage();
      cursorY = 20;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`Total Siswa: ${classStudents.length}`, marginX, cursorY);
    doc.setFont('helvetica', 'bold');
    doc.text(`Partisipasi: Mijel: ${mijelCount} Siswa  |  Bank Sampah: ${bsCount} Siswa`, marginX, cursorY + 5);

    // Signature box on the right
    const sigX = marginX + contentWidth - 48;
    doc.setFont('helvetica', 'normal');
    doc.text('Petugas / Koordinator,', sigX + 24, cursorY, { align: 'center' });
    doc.text('( ..................................... )', sigX + 24, cursorY + 20, { align: 'center' });
  });

  const classNameClean = isAll ? 'Semua_Kelas' : (classes.find(c => c.id === selectedClassId)?.name || 'Kelas').replace(/\s+/g, '_');
  const fileName = `Laporan_Bank_Sampah_${classNameClean}_${monthName}_${period.year}.pdf`;

  // Download PDF
  const pdfBlob = doc.output('blob');
  triggerFileDownload(pdfBlob, fileName);
}

/**
 * 4. HIGH-RESOLUTION JPEG IMAGE DOWNLOAD
 * Uses html2canvas with CORS and dimension safety
 */
export async function exportToJPEGImage(element: HTMLElement, fileName: string) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: element.scrollWidth,
  });

  const dataUrl = canvas.toDataURL('image/jpeg', 0.96);
  triggerFileDownload(dataUrl, fileName);
}
