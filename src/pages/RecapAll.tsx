import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { BarChart2, Download, FileText, ChevronRight } from 'lucide-react';

export default function RecapAll() {
  const navigate = useNavigate();
  const { classes, students, activities, activePeriod } = useStore();

  if (!activePeriod) return <div>No active period</div>;

  const currentActivities = activities.filter(a => a.period_id === activePeriod.id);
  
  let totalSiswaAll = 0;
  let totalMijelAll = 0;
  let totalBSAll = 0;

  const recapData = classes.map(c => {
    const classStudents = students.filter(s => s.class_id === c.id);
    const classActivities = currentActivities.filter(a => a.class_id === c.id);
    
    const mijel = classActivities.filter(a => a.mijel).length;
    const bs = classActivities.filter(a => a.bank_sampah).length;
    
    totalSiswaAll += classStudents.length;
    totalMijelAll += mijel;
    totalBSAll += bs;

    return {
      classId: c.id,
      className: c.class_name,
      totalSiswa: classStudents.length,
      mijel,
      bs
    };
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Rekap Keseluruhan</h1>
          <p className="text-xs text-slate-500 font-medium">Periode: {activePeriod.month} {activePeriod.year}</p>
        </div>
        <button onClick={() => navigate('/reports')} className="p-2 bg-primary-50 text-primary-600 rounded-full">
          <Download className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-800 text-white p-4 rounded-md text-center shadow-sm">
          <div className="text-2xl font-bold">{totalSiswaAll}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Total Siswa</div>
        </div>
        <div className="bg-orange-500 text-white p-4 rounded-md text-center shadow-sm">
          <div className="text-2xl font-bold">{totalMijelAll}</div>
          <div className="text-[10px] text-orange-200 uppercase tracking-wider mt-1">MIJEL</div>
        </div>
        <div className="bg-green-500 text-white p-4 rounded-md text-center shadow-sm">
          <div className="text-2xl font-bold">{totalBSAll}</div>
          <div className="text-[10px] text-green-200 uppercase tracking-wider mt-1">Bank Sampah</div>
        </div>
      </div>

      <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
        <BarChart2 className="w-4 h-4 mr-2 text-slate-500" /> Rincian Per Kelas
      </h2>

      <div className="space-y-3">
        {recapData.map((data) => (
          <button 
            key={data.classId}
            onClick={() => navigate(`/recap-class/${data.classId}`)}
            className="w-full bg-white p-4 rounded-md shadow-sm border border-slate-100 flex items-center justify-between hover:border-primary-300 transition-colors"
          >
            <div className="flex-1 text-left">
              <h3 className="text-lg font-bold text-slate-800">{data.className}</h3>
              <div className="text-xs text-slate-500 mt-1">{data.totalSiswa} Siswa</div>
            </div>
            
            <div className="flex space-x-3 mr-4">
              <div className="text-center">
                <div className="text-xs text-slate-500 font-medium">MIJEL</div>
                <div className="text-sm font-bold text-orange-600">{data.mijel}</div>
              </div>
              <div className="w-px bg-slate-200"></div>
              <div className="text-center">
                <div className="text-xs text-slate-500 font-medium">BS</div>
                <div className="text-sm font-bold text-green-600">{data.bs}</div>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
