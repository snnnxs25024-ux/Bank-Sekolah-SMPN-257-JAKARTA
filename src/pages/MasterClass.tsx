import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { ClassData } from '../lib/types';

export default function MasterClass() {
  const { classes, addClass, updateClass, deleteClass } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [className, setClassName] = useState('');
  const [grade, setGrade] = useState('7');

  const [editName, setEditName] = useState('');
  const [editGrade, setEditGrade] = useState('7');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;
    await addClass({
      name: className.trim(),
      grade,
    });
    setIsAdding(false);
    setClassName('');
  };

  const handleStartEdit = (c: ClassData) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditGrade(c.grade);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    await updateClass(id, {
      name: editName.trim(),
      grade: editGrade,
    });
    setEditingId(null);
  };

  const handleDelete = async (c: ClassData) => {
    if (window.confirm(`Yakin ingin menghapus kelas ${c.name}? Data siswa terkait akan terpengaruh.`)) {
      await deleteClass(c.id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Data Kelas</h1>
          <p className="text-xs text-slate-500">Kelola master data kelas (Tersinkronisasi Supabase)</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 bg-primary-600 text-white rounded-lg flex items-center space-x-1 hover:bg-primary-700 shadow-sm"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6 animate-in slide-in-from-top-2 duration-150">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-slate-800 text-sm">Tambah Kelas Baru</h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Kelas</label>
              <input 
                required 
                value={className} 
                onChange={e => setClassName(e.target.value)} 
                type="text" 
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500 outline-none" 
                placeholder="Contoh: VII A" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat</label>
              <select 
                value={grade} 
                onChange={e => setGrade(e.target.value)} 
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none bg-white"
              >
                <option value="7">Tingkat 7</option>
                <option value="8">Tingkat 8</option>
                <option value="9">Tingkat 9</option>
              </select>
            </div>
            <div className="flex space-x-2 pt-2">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)} 
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition"
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
              >
                Simpan ke Supabase
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {classes.map(c => {
          const isEditing = editingId === c.id;

          return (
            <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              {isEditing ? (
                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="border rounded-lg px-3 py-1.5 text-sm font-bold flex-1"
                    placeholder="Nama Kelas"
                  />
                  <select
                    value={editGrade}
                    onChange={e => setEditGrade(e.target.value)}
                    className="border rounded-lg px-2 py-1.5 text-xs bg-white"
                  >
                    <option value="7">Tingkat 7</option>
                    <option value="8">Tingkat 8</option>
                    <option value="9">Tingkat 9</option>
                  </select>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleSaveEdit(c.id)}
                      className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                      title="Simpan"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"
                      title="Batal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-bold text-slate-800 text-base sm:text-lg flex items-center flex-wrap gap-2">
                    <span>{c.name}</span>
                    <span className="text-xs font-normal bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-600">
                      Tingkat {c.grade}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">ID: {c.id}</div>
                </div>
              )}

              {!isEditing && (
                <div className="flex space-x-1.5 self-end sm:self-auto">
                  <button 
                    onClick={() => handleStartEdit(c)}
                    className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition" 
                    title="Edit Kelas"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(c)}
                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition" 
                    title="Hapus Kelas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {classes.length === 0 && (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            Belum ada kelas yang terdaftar. Klik tombol + di atas untuk menambahkan kelas baru.
          </div>
        )}
      </div>
    </div>
  );
}

