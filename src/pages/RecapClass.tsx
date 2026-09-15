import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ChevronLeft, Download } from 'lucide-react';
import { cn } from '../lib/utils';

export default function RecapClass() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { classes, students, activities, activePeriod } = useStore();

  const currentClass = classes.find(c => c.id === classId);
  if (!currentClass || !activePeriod) return <div>Data not found</div>;

  const classStudents = students.filter(s => s.class_id === classId);
  const classActivities = activities.filter(a => a.class_id === classId && a.period_id === activePeriod.id);

  const mijelCount = classActivities.filter(a => a.mijel).length;
  const bsCount = classActivities.filter(a => a.bank_sampah).length;
  const bothCount = classActivities.filter(a => a.mijel && a.bank_sampah).length;
  const noneCount = classStudents.length - classActivities.filter(a => a.mijel || a.bank_sampah).length;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white px-4 py-4 border-b border-slate-100 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 bg-slate-100 rounded-full text-slate-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Rekap Kelas {currentClass.class_name}</h1>
              <p className="text-xs text-slate-500 font-medium">Periode: {activePeriod.month} {activePeriod.year}</p>
            </div>
          </div>
          <button onClick={() => navigate('/reports')} className="p-2 bg-primary-50 text-primary-600 rounded-full">
            <Download className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <StatBox label="Total" value={classStudents.length} color="bg-slate-100 text-slate-800" />
          <StatBox label="MIJEL" value={mijelCount} color="bg-orange-100 text-orange-800" />
          <StatBox label="BS" value={bsCount} color="bg-green-100 text-green-800" />
          <StatBox label="Keduanya" value={bothCount} color="bg-blue-100 text-blue-800" />
        </div>
        <div className="mt-2 text-xs text-slate-500 text-center">Belum mengikuti: <span className="font-bold text-slate-700">{noneCount} siswa</span></div>
      </div>

      <div className="p-4 flex-1">
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
          <div className="grid grid-cols-[30px_1fr_50px_50px] bg-slate-50 border-b border-slate-200 p-3 text-xs font-bold text-slate-600">
            <div className="text-center">No</div>
            <div>Nama Siswa</div>
            <div className="text-center text-orange-600">MJL</div>
            <div className="text-center text-green-600">BS</div>
          </div>
          
          <div className="divide-y divide-slate-100">
            {classStudents.map((student, index) => {
              const act = classActivities.find(a => a.student_id === student.id);
              const mijel = act?.mijel;
              const bs = act?.bank_sampah;

              return (
                <button 
                  key={student.id} 
                  onClick={() => navigate(`/student/${student.id}`)}
                  className="w-full text-left grid grid-cols-[30px_1fr_50px_50px] p-3 items-center hover:bg-slate-50 transition-colors"
                >
                  <div className="text-xs text-slate-400 text-center font-medium">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="text-sm font-semibold text-slate-800 pr-2 truncate">
                    {student.student_name}
                  </div>
                  <div className="flex justify-center">
                    <span className={cn("text-lg", mijel ? "text-orange-500" : "text-slate-200")}>{mijel ? '✓' : '—'}</span>
                  </div>
                  <div className="flex justify-center">
                    <span className={cn("text-lg", bs ? "text-green-500" : "text-slate-200")}>{bs ? '✓' : '—'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className={cn("p-2 rounded-lg text-center flex flex-col justify-center", color)}>
      <div className="text-lg font-bold leading-tight">{value}</div>
      <div className="text-[10px] uppercase font-semibold opacity-80">{label}</div>
    </div>
  );
}
