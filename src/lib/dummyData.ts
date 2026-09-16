import { ClassData, Period, Student, BankSchoolActivity } from './types';

export const DUMMY_CLASSES: ClassData[] = [
  { id: 'c1', name: 'VII A', grade: '7' },
  { id: 'c2', name: 'VII B', grade: '7' },
  { id: 'c3', name: 'VII C', grade: '7' },
  { id: 'c4', name: 'VIII A', grade: '8' },
  { id: 'c5', name: 'VIII B', grade: '8' },
  { id: 'c6', name: 'VIII F', grade: '8' },
  { id: 'c7', name: 'IX A', grade: '9' },
];

export const DUMMY_STUDENTS: Student[] = [
  { id: 's1', name: 'ABDI GUSTI ABROR', nis: '1001', class_id: 'c6', balance: 0 },
  { id: 's2', name: 'AHMAD RAMADHANI', nis: '1002', class_id: 'c6', balance: 0 },
  { id: 's3', name: 'ALICIA VALEN', nis: '1003', class_id: 'c6', balance: 0 },
  { id: 's4', name: 'BUNGA PUTRI DIANA', nis: '1004', class_id: 'c6', balance: 0 },
  { id: 's5', name: 'CINDY CLAUDIA', nis: '1005', class_id: 'c6', balance: 0 },
  { id: 's6', name: 'DANI FIRMANSYAH', nis: '1006', class_id: 'c6', balance: 0 },
  { id: 's7', name: 'EDWIN NUGROHO', nis: '1007', class_id: 'c6', balance: 0 },
  { id: 's8', name: 'FAJAR SIDIK', nis: '2001', class_id: 'c1', balance: 0 },
  { id: 's9', name: 'GITA PERMATA', nis: '2002', class_id: 'c1', balance: 0 },
];

export const DUMMY_PERIODS: Period[] = [
  { id: 'p1', month: 7, year: 2026, is_active: false },
  { id: 'p2', month: 8, year: 2026, is_active: false },
  { id: 'p3', month: 9, year: 2026, is_active: true },
];

export const DUMMY_ACTIVITIES: BankSchoolActivity[] = [
  { id: 'a1', student_id: 's2', period_id: 'p1', mijel: true, bank_sampah: true },
  { id: 'a2', student_id: 's2', period_id: 'p2', mijel: true, bank_sampah: false },
  { id: 'a3', student_id: 's2', period_id: 'p3', mijel: false, bank_sampah: true },
];
