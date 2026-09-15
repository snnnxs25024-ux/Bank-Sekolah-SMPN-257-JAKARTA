import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Edit2, Trash2, Search, Upload } from 'lucide-react';
import { Student } from '../lib/types';

export default function MasterStudent() {
  const { students, classes, addStudent } = useStore();
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  const [studentName, setStudentName] = useState('');
  const [nis, setNis] = useState('');
  const [classId, setClassId] = useState(classes[0]?.id || '');

  const filteredStudents = students.filter(s => s.student_name.toLowerCase().includes(search.toLowerCase()));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent: Student = {
      id: `s-${Date.now()}`,
      student_name: studentName,
      nis,
      class_id: classId
    };
    addStudent(newStudent);
    setIsAdding(false);
    setStudentName('');
    setNis('');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Data Siswa</h1>
          <p className="text-xs text-slate-500">Kelola data siswa</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsImporting(!isImporting)}
            className="p-2 bg-green-100 text-green-700 rounded-lg flex items-center hover:bg-green-200"
          >
            <Upload className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="p-2 bg-primary-600 text-white rounded-lg flex items-center hover:bg-primary-700"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-md text-sm bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
          placeholder="Cari nama siswa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isImporting && (
        <div className="bg-white p-5 rounded-md shadow-sm border border-slate-200 mb-6">
          <h3 className="font-bold text-slate-800 mb-2">Import dari Excel</h3>
          <p className="text-xs text-slate-500 mb-4">Format: Nama Siswa | Kelas (Contoh: Ahmad | VIII F)</p>
          <div className="border-2 border-dashed border-slate-300 rounded-md p-8 text-center cursor-pointer hover:bg-slate-50">
            <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <span className="text-sm text-slate-600 font-medium">Pilih file Excel (.xlsx)</span>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="bg-white p-5 rounded-md shadow-sm border border-slate-200 mb-6">
          <h3 className="font-bold text-slate-800 mb-4">Tambah Siswa Baru</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nama Lengkap</label>
              <input required value={studentName} onChange={e=>setStudentName(e.target.value)} type="text" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">NIS (Opsional)</label>
              <input value={nis} onChange={e=>setNis(e.target.value)} type="text" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Kelas</label>
              <select value={classId} onChange={e=>setClassId(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm outline-none bg-white">
                {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
              </select>
            </div>
            <div className="flex space-x-2 pt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold">Batal</button>
              <button type="submit" className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold">Simpan</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100">
          {filteredStudents.slice(0, 50).map((student) => (
            <div key={student.id} className="p-3 flex justify-between items-center hover:bg-slate-50">
              <div>
                <div className="font-semibold text-slate-800 text-sm">{student.student_name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Kelas {classes.find(c => c.id === student.class_id)?.class_name} 
                  {student.nis && ` • NIS: ${student.nis}`}
                </div>
              </div>
              <div className="flex space-x-1">
                <button className="p-1.5 text-slate-400 hover:text-blue-500"><Edit2 className="w-4 h-4" /></button>
                <button className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {filteredStudents.length > 50 && (
            <div className="p-4 text-center text-xs text-slate-500">
              Menampilkan 50 dari {filteredStudents.length} siswa. Gunakan pencarian untuk hasil spesifik.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
