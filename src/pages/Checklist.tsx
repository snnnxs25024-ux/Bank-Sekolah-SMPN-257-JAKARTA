import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ChevronLeft, Search, Save, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { BankSchoolActivity } from '../lib/types';

export default function Checklist() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { classes, students, activePeriod, activities, saveActivity } = useStore();
  
  const [search, setSearch] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const currentClass = classes.find(c => c.id === classId);
  const classStudents = students.filter(s => s.class_id === classId);
  
  // Local state for checkboxes
  const [checklistData, setChecklistData] = useState<Record<string, { mijel: boolean, bs: boolean }>>({});

  useEffect(() => {
    if (!activePeriod || !classId) return;
    
    // Load existing data
    const existingActivities = activities.filter(a => a.class_id === classId && a.period_id === activePeriod.id);
    const initialData: Record<string, { mijel: boolean, bs: boolean }> = {};
    
    classStudents.forEach(student => {
      const studentActivity = existingActivities.find(a => a.student_id === student.id);
      initialData[student.id] = {
        mijel: studentActivity?.mijel || false,
        bs: studentActivity?.bank_sampah || false
      };
    });
    setChecklistData(initialData);
  }, [classId, activePeriod, activities, classStudents.length]);

  if (!currentClass || !activePeriod) return <div>Class or Period not found</div>;

  const filteredStudents = classStudents.filter(s => s.student_name.toLowerCase().includes(search.toLowerCase()));
  
  const mijelCount = Object.values(checklistData).filter(v => v.mijel).length;
  const bsCount = Object.values(checklistData).filter(v => v.bs).length;

  const handleToggle = (studentId: string, field: 'mijel' | 'bs') => {
    setChecklistData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: !prev[studentId]?.[field]
      }
    }));
  };

  const handleCheckAll = (field: 'mijel' | 'bs') => {
    const allChecked = Object.values(checklistData).every(v => v[field]);
    const newData = { ...checklistData };
    classStudents.forEach(s => {
      if (!newData[s.id]) newData[s.id] = { mijel: false, bs: false };
      newData[s.id][field] = !allChecked;
    });
    setChecklistData(newData);
  };

  const handleSave = () => {
    const newActivities: BankSchoolActivity[] = classStudents.map(student => ({
      id: `a-${student.id}-${activePeriod.id}`,
      student_id: student.id,
      class_id: classId,
      period_id: activePeriod.id,
      mijel: checklistData[student.id]?.mijel || false,
      bank_sampah: checklistData[student.id]?.bs || false,
      created_at: new Date().toISOString()
    }));
    
    saveActivity(newActivities);
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate(-1);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full relative bg-white pb-20">
      {/* Header Fixed */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm px-4 py-4">
        <div className="flex items-center space-x-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 bg-slate-100 rounded-full text-slate-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">BANK SEKOLAH</h1>
            <p className="text-xs text-primary-600 font-medium">Periode: {activePeriod.month} {activePeriod.year}</p>
          </div>
        </div>

        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-md border border-slate-100 mb-4">
          <div>
            <div className="text-sm font-bold text-slate-800">Kelas {currentClass.class_name}</div>
            <div className="text-xs text-slate-500">{currentClass.teacher_name}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-slate-500">Total Siswa</div>
            <div className="text-sm font-bold text-slate-800">{classStudents.length}</div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Cari nama siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content Scrollable */}
      <div className="p-4 flex-1">
        
        {/* Bulk Actions & Counters */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2 w-full">
            <button 
              onClick={() => handleCheckAll('mijel')}
              className="flex-1 bg-orange-50 text-orange-700 py-2 rounded-lg text-xs font-semibold border border-orange-200 hover:bg-orange-100 transition-colors flex flex-col items-center justify-center"
            >
              <span>Semua MIJEL</span>
              <span className="text-[10px] opacity-80">{mijelCount} / {classStudents.length}</span>
            </button>
            <button 
              onClick={() => handleCheckAll('bs')}
              className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg text-xs font-semibold border border-green-200 hover:bg-green-100 transition-colors flex flex-col items-center justify-center"
            >
              <span>Semua BS</span>
              <span className="text-[10px] opacity-80">{bsCount} / {classStudents.length}</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
          <div className="grid grid-cols-[30px_1fr_60px_60px] bg-slate-50 border-b border-slate-200 p-3 text-xs font-bold text-slate-600">
            <div className="text-center">No</div>
            <div>Nama Siswa</div>
            <div className="text-center text-orange-600">MIJEL</div>
            <div className="text-center text-green-600">BS</div>
          </div>
          
          <div className="divide-y divide-slate-100">
            {filteredStudents.map((student, index) => (
              <div key={student.id} className="grid grid-cols-[30px_1fr_60px_60px] p-3 items-center hover:bg-slate-50 transition-colors">
                <div className="text-xs text-slate-400 text-center font-medium">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="text-sm font-semibold text-slate-800 pr-2 truncate">
                  {student.student_name}
                </div>
                <div className="flex justify-center">
                  <button 
                    onClick={() => handleToggle(student.id, 'mijel')}
                    className={cn(
                      "w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all",
                      checklistData[student.id]?.mijel 
                        ? "bg-orange-500 border-orange-500 text-white" 
                        : "border-slate-300 bg-slate-50 text-transparent"
                    )}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </button>
                </div>
                <div className="flex justify-center">
                  <button 
                    onClick={() => handleToggle(student.id, 'bs')}
                    className={cn(
                      "w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all",
                      checklistData[student.id]?.bs 
                        ? "bg-green-500 border-green-500 text-white" 
                        : "border-slate-300 bg-slate-50 text-transparent"
                    )}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </button>
                </div>
              </div>
            ))}
            
            {filteredStudents.length === 0 && (
              <div className="p-6 text-center text-slate-500 text-sm">
                Siswa tidak ditemukan.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action / Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 z-40 max-w-md mx-auto">
        <button
          onClick={handleSave}
          className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-md shadow-lg shadow-primary-600/30 hover:bg-primary-700 transition-colors flex justify-center items-center space-x-2"
        >
          <Save className="w-5 h-5" />
          <span>SIMPAN DATA</span>
        </button>
      </div>

      {/* Success Notification overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6">
          <div className="bg-white rounded-lg p-6 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Berhasil Disimpan!</h3>
            <p className="text-sm text-slate-600">
              Data Bank Sekolah <span className="font-semibold">{activePeriod.month} {activePeriod.year}</span> kelas <span className="font-semibold">{currentClass.class_name}</span> berhasil disimpan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
