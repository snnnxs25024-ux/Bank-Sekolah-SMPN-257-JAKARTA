import { create } from 'zustand';
import { ClassData, Period, Student, BankSchoolActivity, User } from '../lib/types';
import { supabase } from '../lib/supabase';

interface AppState {
  user: User | null;
  classes: ClassData[];
  students: Student[];
  periods: Period[];
  activities: BankSchoolActivity[];
  activePeriod: Period | null;
  isLoading: boolean;
  
  login: (user: User) => void;
  logout: () => void;
  setActivePeriod: (period: Period) => void;
  
  fetchInitialData: () => Promise<void>;
  fetchActivitiesByPeriod: (periodId: string) => Promise<void>;
  saveActivity: (activities: Partial<BankSchoolActivity>[]) => Promise<void>;
  addClass: (newClass: Omit<ClassData, 'id' | 'created_at'>) => Promise<ClassData | null>;
  addStudent: (newStudent: Omit<Student, 'id' | 'created_at'>) => Promise<void>;
  addStudents: (newStudents: Omit<Student, 'id' | 'created_at'>[]) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  classes: [],
  students: [],
  periods: [],
  activities: [],
  activePeriod: null,
  isLoading: false,

  login: (user) => set({ user }),
  logout: () => set({ user: null }),
  setActivePeriod: (period) => {
    set({ activePeriod: period });
    get().fetchActivitiesByPeriod(period.id);
  },

  fetchInitialData: async () => {
    set({ isLoading: true });

    // 1. Read existing local storage immediately to ensure instant display without data loss
    const localClasses: ClassData[] = JSON.parse(localStorage.getItem('local_classes') || '[]');
    const localStudents: Student[] = JSON.parse(localStorage.getItem('local_students') || '[]');
    const localPeriods: Period[] = JSON.parse(localStorage.getItem('local_periods') || '[]');

    try {
      const [classesRes, studentsRes, periodsRes] = await Promise.all([
        supabase.from('classes').select('*').order('grade').order('name'),
        supabase.from('students').select('*').order('name'),
        supabase.from('periods').select('*').order('year', { ascending: false }).order('month', { ascending: false })
      ]);

      let classesData: ClassData[] = (!classesRes.error && classesRes.data) ? classesRes.data : [];
      let studentsData: Student[] = (!studentsRes.error && studentsRes.data) ? studentsRes.data : [];
      let periodsData: Period[] = (!periodsRes.error && periodsRes.data) ? periodsRes.data : [];

      // If database returned empty or errored, preserve data from localStorage
      if (classesData.length === 0 && localClasses.length > 0) {
        classesData = localClasses;
      } else if (classesData.length > 0) {
        // Merge any locally added classes not yet in Supabase
        const existingClassIds = new Set(classesData.map(c => c.id));
        const localOnlyClasses = localClasses.filter(c => !existingClassIds.has(c.id));
        classesData = [...classesData, ...localOnlyClasses];
        localStorage.setItem('local_classes', JSON.stringify(classesData));
      }

      if (studentsData.length === 0 && localStudents.length > 0) {
        studentsData = localStudents;
      } else if (studentsData.length > 0) {
        // Merge any locally added students not yet in Supabase
        const existingStudentIds = new Set(studentsData.map(s => s.id));
        const localOnlyStudents = localStudents.filter(s => !existingStudentIds.has(s.id));
        studentsData = [...studentsData, ...localOnlyStudents];
        localStorage.setItem('local_students', JSON.stringify(studentsData));
      }

      if (periodsData.length === 0 && localPeriods.length > 0) {
        periodsData = localPeriods;
      } else if (periodsData.length > 0) {
        localStorage.setItem('local_periods', JSON.stringify(periodsData));
      }

      const activePeriod = periodsData.find((p: Period) => p.is_active) || periodsData[0] || null;

      set({
        classes: classesData,
        students: studentsData,
        periods: periodsData,
        activePeriod,
        isLoading: false
      });

      if (activePeriod) {
        get().fetchActivitiesByPeriod(activePeriod.id);
      }
    } catch (error) {
      console.warn('Supabase connection error, loading from localStorage', error);
      const activePeriod = localPeriods.find((p: Period) => p.is_active) || localPeriods[0] || null;

      set({
        classes: localClasses,
        students: localStudents,
        periods: localPeriods,
        activePeriod,
        isLoading: false
      });
    }
  },

  fetchActivitiesByPeriod: async (periodId) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('period_id', periodId);
      
      if (!error && data) {
        set({ activities: data });
      } else {
        const localActivities = JSON.parse(localStorage.getItem('local_activities') || '[]');
        set({ activities: localActivities.filter((a: BankSchoolActivity) => a.period_id === periodId) });
      }
    } catch {
      const localActivities = JSON.parse(localStorage.getItem('local_activities') || '[]');
      set({ activities: localActivities.filter((a: BankSchoolActivity) => a.period_id === periodId) });
    }
  },

  saveActivity: async (newActivities) => {
    // 1. Immediately update local storage and state
    const localActivities: BankSchoolActivity[] = JSON.parse(localStorage.getItem('local_activities') || '[]');
    const updated = [...localActivities];
    
    newActivities.forEach(act => {
      const idx = updated.findIndex(u => (act.id && u.id === act.id) || (u.student_id === act.student_id && u.period_id === act.period_id));
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], ...act };
      } else {
        updated.push({ id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, ...act } as BankSchoolActivity);
      }
    });

    localStorage.setItem('local_activities', JSON.stringify(updated));
    const periodId = newActivities[0]?.period_id;
    if (periodId) {
      set({ activities: updated.filter((a: BankSchoolActivity) => a.period_id === periodId) });
    }

    // 2. Persist to Supabase in the background
    try {
      await supabase.from('activities').upsert(newActivities, { onConflict: 'id' }).select();
    } catch (err) {
      console.warn('Activity saved locally, Supabase sync skipped:', err);
    }
  },

  addClass: async (newClass) => {
    const tempClass: ClassData = {
      id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newClass.name,
      grade: newClass.grade,
      created_at: new Date().toISOString()
    };

    // Save to state and localStorage first
    set((state) => {
      const updated = [...state.classes, tempClass];
      localStorage.setItem('local_classes', JSON.stringify(updated));
      return { classes: updated };
    });

    // Try Supabase insert
    try {
      const { data, error } = await supabase.from('classes').insert([{
        name: newClass.name,
        grade: newClass.grade
      }]).select().single();

      if (!error && data) {
        set((state) => {
          const updated = state.classes.map(c => c.id === tempClass.id ? data : c);
          localStorage.setItem('local_classes', JSON.stringify(updated));
          return { classes: updated };
        });
        return data;
      }
    } catch (err) {
      console.warn('Class saved locally, Supabase insert skipped:', err);
    }

    return tempClass;
  },

  addStudent: async (newStudent) => {
    const tempStudent: Student = {
      id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      nis: newStudent.nis,
      name: newStudent.name,
      class_id: newStudent.class_id,
      balance: newStudent.balance || 0,
      created_at: new Date().toISOString()
    };

    // Save locally and update state immediately
    set((state) => {
      const updated = [...state.students, tempStudent];
      localStorage.setItem('local_students', JSON.stringify(updated));
      return { students: updated };
    });

    // Try Supabase insert
    try {
      const { data, error } = await supabase.from('students').insert([{
        nis: newStudent.nis,
        name: newStudent.name,
        class_id: newStudent.class_id,
        balance: newStudent.balance || 0
      }]).select().single();

      if (!error && data) {
        set((state) => {
          const updated = state.students.map(s => s.id === tempStudent.id ? data : s);
          localStorage.setItem('local_students', JSON.stringify(updated));
          return { students: updated };
        });
      }
    } catch (err) {
      console.warn('Student saved locally, Supabase insert skipped:', err);
    }
  },

  addStudents: async (newStudents) => {
    const createdList: Student[] = newStudents.map((s, idx) => ({
      id: `s-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      nis: s.nis,
      name: s.name,
      class_id: s.class_id,
      balance: s.balance || 0,
      created_at: new Date().toISOString()
    }));

    // Update state and local storage immediately
    set((state) => {
      const updated = [...state.students, ...createdList];
      localStorage.setItem('local_students', JSON.stringify(updated));
      return { students: updated };
    });

    // Try Supabase bulk insert
    try {
      const payload = newStudents.map(s => ({
        nis: s.nis,
        name: s.name,
        class_id: s.class_id,
        balance: s.balance || 0
      }));

      const { data, error } = await supabase.from('students').insert(payload).select();
      if (!error && data && data.length > 0) {
        set((state) => {
          const tempIds = new Set(createdList.map(c => c.id));
          const withoutTemp = state.students.filter(s => !tempIds.has(s.id));
          const updated = [...withoutTemp, ...data];
          localStorage.setItem('local_students', JSON.stringify(updated));
          return { students: updated };
        });
      }
    } catch (err) {
      console.warn('Students saved locally, Supabase bulk insert skipped:', err);
    }
  }
}));
