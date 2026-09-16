const ROMAN_GRADES: Record<string, string> = {
  '7': 'VII',
  '8': 'VIII',
  '9': 'IX',
  VII: 'VII',
  VIII: 'VIII',
  IX: 'IX',
};

export function formatClassName(className: string | undefined, grade?: string): string {
  const cleaned = (className ?? '')
    .trim()
    .replace(/^kelas\s+/i, '')
    .replace(/[-_/]+/g, ' ')
    .replace(/\s+/g, ' ');
  const matched = cleaned.match(/^(VIII|VII|IX|7|8|9)\s*(.*)$/i);

  if (matched) {
    const romanGrade = ROMAN_GRADES[matched[1].toUpperCase()];
    const suffix = matched[2].trim().toUpperCase();
    return suffix ? `${romanGrade} ${suffix}` : romanGrade;
  }

  const romanGrade = ROMAN_GRADES[(grade ?? '').trim().toUpperCase()];
  if (romanGrade) return cleaned ? `${romanGrade} ${cleaned.toUpperCase()}` : romanGrade;

  return cleaned.toUpperCase() || '—';
}

export function reportFileBase(month: string, year: number, className: string): string {
  const safeClassName = className
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const safeMonth = month
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return `Laporan_Bank_Sampah_${safeClassName || 'Semua_Kelas'}_${safeMonth}_${year}`;
}
