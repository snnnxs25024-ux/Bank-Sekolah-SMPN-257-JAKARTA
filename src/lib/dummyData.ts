import { ClassData, Period, Student, BankSchoolActivity } from './types';

export const DUMMY_CLASSES: ClassData[] = [
  { id: 'c1', class_name: 'VII A', grade: '7', teacher_name: 'Budi Santoso, S.Pd' },
  { id: 'c2', class_name: 'VII B', grade: '7', teacher_name: 'Siti Aminah, M.Pd' },
  { id: 'c3', class_name: 'VII C', grade: '7', teacher_name: 'Eko Prasetyo, S.Pd' },
  { id: 'c4', class_name: 'VIII A', grade: '8', teacher_name: 'Dewi Lestari, S.Pd' },
  { id: 'c5', class_name: 'VIII B', grade: '8', teacher_name: 'Andi Saputra, S.Pd' },
  { id: 'c6', class_name: 'VIII F', grade: '8', teacher_name: 'Ervin Marbun, S.Pd' },
  { id: 'c7', class_name: 'IX A', grade: '9', teacher_name: 'Rini Yulianti, M.Pd' },
];

export const DUMMY_STUDENTS: Student[] = [
  { id: 's1', student_name: 'ABDI GUSTI ABROR', nis: '1001', class_id: 'c6' },
  { id: 's2', student_name: 'AHMAD RAMADHANI', nis: '1002', class_id: 'c6' },
  { id: 's3', student_name: 'ALICIA VALEN', nis: '1003', class_id: 'c6' },
  { id: 's4', student_name: 'BUNGA PUTRI DIANA', nis: '1004', class_id: 'c6' },
  { id: 's5', student_name: 'CINDY CLAUDIA', nis: '1005', class_id: 'c6' },
  { id: 's6', student_name: 'DANI FIRMANSYAH', nis: '1006', class_id: 'c6' },
  { id: 's7', student_name: 'EDWIN NUGROHO', nis: '1007', class_id: 'c6' },
  // some other class
  { id: 's8', student_name: 'FAJAR SIDIK', nis: '2001', class_id: 'c1' },
  { id: 's9', student_name: 'GITA PERMATA', nis: '2002', class_id: 'c1' },
];

export const DUMMY_PERIODS: Period[] = [
  { id: 'p1', month: 'Juli', year: 2026 },
  { id: 'p2', month: 'Agustus', year: 2026 },
  { id: 'p3', month: 'September', year: 2026 },
];

export const DUMMY_ACTIVITIES: BankSchoolActivity[] = [
  { id: 'a1', student_id: 's2', class_id: 'c6', period_id: 'p1', mijel: true, bank_sampah: true },
  { id: 'a2', student_id: 's2', class_id: 'c6', period_id: 'p2', mijel: true, bank_sampah: false },
  { id: 'a3', student_id: 's2', class_id: 'c6', period_id: 'p3', mijel: false, bank_sampah: true },
];
