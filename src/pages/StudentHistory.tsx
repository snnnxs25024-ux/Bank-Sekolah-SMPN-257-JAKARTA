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

  const totalDeposit = studentActivities.reduce((sum, a) => sum + (a.deposit || 0), 0);
  const totalWithdrawal = studentActivities.reduce((sum, a) => sum + (a.withdrawal || 0), 0);

  return (
    <div className="p-6 pb-24">
      <div className="flex items-center space-x-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 bg-slate-100 rounded-full text-slate-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Buku Tabungan Siswa</h1>
      </div>

      <div className="bg-white rounded-lg p-6 border border-slate-100 shadow-sm text-center mb-6">
        <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-500">
          <UserCircle className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">{student.name}</h2>
        <div className="text-sm font-medium text-slate-500 mb-4">Kelas {currentClass?.name} | NIS: {student.nis}</div>
        
        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-2">
          <div>
            <div className="text-lg font-bold text-green-600">Rp {totalDeposit.toLocaleString('id-ID')}</div>
            <div className="text-xs text-slate-500">Total Setoran</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-600">Rp {totalWithdrawal.toLocaleString('id-ID')}</div>
            <div className="text-xs text-slate-500">Total Tarikan</div>
          </div>
        </div>
      </div>

      <h3 className="text-sm font-bold text-slate-800 mb-3">Riwayat Mutasi Per Bulan</h3>
      
      <div className="space-y-3">
        {periods.map(period => {
          const act = studentActivities.find(a => a.period_id === period.id);
          const deposit = act?.deposit || 0;
          const withdrawal = act?.withdrawal || 0;
          
          return (
            <div key={period.id} className="bg-white p-4 rounded-md border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Bulan: {period.month} / {period.year}</div>
                <div className="text-xs text-slate-500">
                  {(!deposit && !withdrawal && !act?.is_absent) ? 'Tidak ada transaksi' : act?.is_absent ? 'Alpa / Tidak Hadir' : 'Ada transaksi'}
                </div>
              </div>
              <div className="flex space-x-3 text-right">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">SETOR</div>
                  <div className={cn("text-sm font-bold", deposit ? "text-green-600" : "text-slate-300")}>
                    {deposit ? deposit.toLocaleString('id-ID') : '-'}
                  </div>
                </div>
                <div className="w-px bg-slate-200"></div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">TARIK</div>
                  <div className={cn("text-sm font-bold", withdrawal ? "text-orange-600" : "text-slate-300")}>
                    {withdrawal ? withdrawal.toLocaleString('id-ID') : '-'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
