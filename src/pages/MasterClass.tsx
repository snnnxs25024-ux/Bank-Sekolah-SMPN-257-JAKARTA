import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Settings, Plus, Edit2, Trash2 } from 'lucide-react';
import { ClassData } from '../lib/types';

export default function MasterClass() {
  const { classes, addClass } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  
  const [className, setClassName] = useState('');
  const [grade, setGrade] = useState('7');
  const [teacher, setTeacher] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newClass: ClassData = {
      id: `c-${Date.now()}`,
      class_name: className,
      grade,
      teacher_name: teacher
    };
    addClass(newClass);
    setIsAdding(false);
    setClassName('');
    setTeacher('');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Data Kelas</h1>
          <p className="text-xs text-slate-500">Kelola master data kelas</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 bg-primary-600 text-white rounded-lg flex items-center space-x-1 hover:bg-primary-700"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-5 rounded-md shadow-sm border border-slate-200 mb-6">
          <h3 className="font-bold text-slate-800 mb-4">Tambah Kelas Baru</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nama Kelas</label>
              <input required value={className} onChange={e=>setClassName(e.target.value)} type="text" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500 outline-none" placeholder="Contoh: VII A" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Tingkat</label>
              <select value={grade} onChange={e=>setGrade(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm outline-none">
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Wali Kelas</label>
              <input required value={teacher} onChange={e=>setTeacher(e.target.value)} type="text" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500 outline-none" placeholder="Nama lengkap wali kelas" />
            </div>
            <div className="flex space-x-2 pt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold">Batal</button>
              <button type="submit" className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold">Simpan</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {classes.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-md border border-slate-100 shadow-sm flex justify-between items-center">
            <div>
              <div className="font-bold text-slate-800 text-lg">{c.class_name} <span className="text-xs font-normal bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 ml-2">Tingkat {c.grade}</span></div>
              <div className="text-sm text-slate-500 mt-1">Wali: {c.teacher_name}</div>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 text-blue-500 bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
              <button className="p-2 text-red-500 bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
