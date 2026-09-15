import { create } from 'zustand';
import { ClassData, Period, Student, BankSchoolActivity, User } from '../lib/types';
import { DUMMY_CLASSES, DUMMY_PERIODS, DUMMY_STUDENTS, DUMMY_ACTIVITIES } from '../lib/dummyData';

interface AppState {
  user: User | null;
  classes: ClassData[];
  students: Student[];
  periods: Period[];
  activities: BankSchoolActivity[];
  activePeriod: Period | null;
  
  login: (user: User) => void;
  logout: () => void;
  setActivePeriod: (period: Period) => void;
  saveActivity: (activities: BankSchoolActivity[]) => void;
  addClass: (newClass: ClassData) => void;
  addStudent: (newStudent: Student) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  classes: DUMMY_CLASSES,
  students: DUMMY_STUDENTS,
  periods: DUMMY_PERIODS,
  activities: DUMMY_ACTIVITIES,
  activePeriod: DUMMY_PERIODS[2], // Default to September 2026

  login: (user) => set({ user }),
  logout: () => set({ user: null }),
  setActivePeriod: (period) => set({ activePeriod: period }),
  saveActivity: (newActivities) => set((state) => {
    // Filter out old activities for these students and this period
    const newStudentIds = newActivities.map(a => a.student_id);
    const periodId = newActivities[0]?.period_id;
    if (!periodId) return state;

    const filteredOldActivities = state.activities.filter(a => 
      !(a.period_id === periodId && newStudentIds.includes(a.student_id))
    );

    return { activities: [...filteredOldActivities, ...newActivities] };
  }),
  addClass: (newClass) => set((state) => ({ classes: [...state.classes, newClass] })),
  addStudent: (newStudent) => set((state) => ({ students: [...state.students, newStudent] })),
}));
