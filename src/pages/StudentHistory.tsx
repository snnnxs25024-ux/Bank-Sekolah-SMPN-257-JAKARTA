import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ChevronLeft, UserCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function StudentHistory() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { students, classes, periods, activities } = useStore();

  const student = students.find(s => s.id === studentId);
  if (!student) return <div>Student not found</div>;

  const currentClass = classes.find(c => c.id === student.class_id);
  const studentActivities = activities.filter(a => a.student_id === student.id);

  // Calculate stats based on all periods (assuming periods array is all past periods)
  const participationCount = studentActivities.filter(a => a.mijel || a.bank_sampah).length;
  const percentage = Math.round((participationCount / (periods.length || 1)) * 100);

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 bg-slate-100 rounded-full text-slate-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Profil Siswa</h1>
      </div>

      <div className="bg-white rounded-lg p-6 border border-slate-100 shadow-sm text-center mb-6">
        <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-500">
          <UserCircle className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">{student.student_name}</h2>
        <div className="text-sm font-medium text-slate-500 mb-4">Kelas {currentClass?.class_name}</div>
        
        <div className="flex justify-center items-center space-x-4 border-t border-slate-100 pt-4 mt-2">
          <div>
            <div className="text-2xl font-bold text-primary-600">{percentage}%</div>
            <div className="text-xs text-slate-500">Partisipasi</div>
          </div>
        </div>
      </div>

      <h3 className="text-sm font-bold text-slate-800 mb-3">Riwayat Kegiatan</h3>
      
      <div className="space-y-3">
        {periods.map(period => {
          const act = studentActivities.find(a => a.period_id === period.id);
          const mijel = act?.mijel;
          const bs = act?.bank_sampah;

          return (
            <div key={period.id} className="bg-white p-4 rounded-md border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">{period.month} {period.year}</div>
                <div className="text-xs text-slate-500">
                  {(!mijel && !bs) ? 'Tidak ada partisipasi' : 'Ada partisipasi'}
                </div>
              </div>
              <div className="flex space-x-2">
                <div className={cn("px-2 py-1 rounded-md text-xs font-bold", mijel ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-400")}>
                  MIJEL {mijel ? '✓' : '✕'}
                </div>
                <div className={cn("px-2 py-1 rounded-md text-xs font-bold", bs ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400")}>
                  BS {bs ? '✓' : '✕'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
