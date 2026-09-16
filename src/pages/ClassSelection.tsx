import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ChevronLeft, Users } from 'lucide-react';

export default function ClassSelection() {
  const navigate = useNavigate();
  const { classes, students, activePeriod } = useStore();

  const handleClassClick = (classId: string) => {
    navigate(`/checklist/${classId}`);
  };

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <button onClick={() => navigate('/period')} className="p-2 -ml-2 bg-slate-100 rounded-full text-slate-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pilih Kelas</h1>
          <p className="text-xs text-slate-500 font-medium">Periode: {activePeriod?.month} {activePeriod?.year}</p>
        </div>
      </div>

      <div className="space-y-4">
        {classes.map(c => {
          const classStudentsCount = students.filter(s => s.class_id === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => handleClassClick(c.id)}
              className="w-full bg-white p-5 rounded-lg shadow-sm border border-slate-100 flex items-center justify-between hover:bg-slate-50 hover:border-primary-200 transition-colors text-left"
            >
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">{c.name}</h3>
                <div className="flex items-center space-x-2 text-sm text-slate-500 mb-2">
                  <Users className="w-4 h-4" />
                  <span>{classStudentsCount} Siswa</span>
                </div>
                <div className="text-xs bg-slate-100 inline-block px-2 py-1 rounded-md text-slate-600 font-medium">
                  Wali: {c.created_at}
                </div>
              </div>
              <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
                <ChevronLeft className="w-5 h-5 rotate-180" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  );
}
