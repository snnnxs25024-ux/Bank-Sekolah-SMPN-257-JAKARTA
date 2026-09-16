import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Edit2, Trash2, Search, Upload, Download, Check, X, School } from 'lucide-react';
import { Student } from '../lib/types';
import { cn } from '../lib/utils';

export default function MasterStudent() {
  const { students, classes, addStudent, addStudents, addClass } = useStore();
  
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Form fields
  const [studentName, setStudentName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  
  // Custom new class inputs if user wants to type a custom class
  const [isCustomClass, setIsCustomClass] = useState(false);
  const [customClassName, setCustomClassName] = useState('');
  const [customGrade, setCustomGrade] = useState('7');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  // Filtered by name, class name, or class id
  const filteredStudents = students.filter(s => {
    const q = search.toLowerCase();
    const c = classes.find(cls => cls.id === s.class_id || cls.name === s.class_id);
    const cName = (c?.name || s.class_id || '').toLowerCase();
    const cId = (c?.id || s.class_id || '').toLowerCase();
    const sName = (s.name || '').toLowerCase();
    return sName.includes(q) || cName.includes(q) || cId.includes(q);
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      alert("Silakan masukkan nama siswa.");
      return;
    }

    let finalClassId = selectedClassId;

    // If user enters a custom class
    if (isCustomClass) {
      if (!customClassName.trim()) {
        alert("Silakan masukkan nama kelas baru.");
        return;
      }
      const newCls = await addClass({
        name: customClassName.trim(),
        grade: customGrade,
      });
      if (newCls) {
        finalClassId = newCls.id;
      } else {
        finalClassId = customClassName.trim();
      }
    }

    if (!finalClassId) {
      alert("Silakan pilih atau masukkan kelas terlebih dahulu.");
      return;
    }

    const newStudent = {
      name: studentName.trim().toUpperCase(),
      class_id: finalClassId,
      balance: 0,
    };

    await addStudent(newStudent);
    setIsAdding(false);
    setStudentName('');
    setIsCustomClass(false);
    setCustomClassName('');
  };

  const handleDownloadTemplate = () => {
    // Template without NIS
    const csvContent = "Nama,Kelas,ID Kelas\nAri Prasetyo,7 A,c1\nBudi Santoso,7 B,c2\nCitra Dewi,8 A,c4\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Template_Siswa.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target?.result as string;
      const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length <= 1) {
        alert("File kosong atau format salah.");
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/["']/g, ''));
      const newStudentsToInsert: Omit<Student, 'id' | 'created_at'>[] = [];
      let skipped = 0;

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(c => c.trim().replace(/["']/g, ''));
        const rowObj: Record<string, string> = {};
        headers.forEach((h, index) => {
          rowObj[h] = row[index] || '';
        });

        const name = rowObj['nama'] || rowObj['name'] || rowObj['nama siswa'];
        const rawClass = rowObj['kelas'] || rowObj['nama kelas'] || rowObj['class'];
        const rawClassId = rowObj['id kelas'] || rowObj['id_kelas'] || rowObj['id'];

        if (!name) {
          skipped++;
          continue;
        }

        // Match existing class by ID or Name
        let matched = classes.find(c => 
          (rawClassId && c.id.toLowerCase() === rawClassId.toLowerCase()) ||
          (rawClass && c.name.toLowerCase() === rawClass.toLowerCase()) ||
          (rawClass && c.name.replace(/\s+/g, '').toLowerCase() === rawClass.replace(/\s+/g, '').toLowerCase())
        );

        if (!matched && (rawClass || rawClassId)) {
          const newName = rawClass || rawClassId || 'Kelas Baru';
          const detectedGrade = newName.match(/\d+/)?.[0] || '7';
          matched = await addClass({
            name: newName,
            grade: detectedGrade,
          }) || undefined;
        }

        const finalClassId = matched ? matched.id : (classes[0]?.id || 'c1');

        newStudentsToInsert.push({
          name: name.toUpperCase(),
          class_id: finalClassId,
          balance: 0,
        });
      }

      if (newStudentsToInsert.length > 0) {
        await addStudents(newStudentsToInsert);
        alert(`Berhasil mengimpor ${newStudentsToInsert.length} siswa!`);
        setIsImporting(false);
      } else {
        alert("Tidak ada siswa yang berhasil diimpor.");
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] bg-slate-50 overflow-hidden">
      {/* 1. Header Kontrol Atas (Fixed / Tidak ikut scroll tabel) */}
      <div className="flex-none p-4 sm:p-6 pb-3 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Data Siswa</h1>
            <p className="text-xs text-slate-500 font-medium">Total: {students.length} siswa terdaftar</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => { setIsImporting(!isImporting); setIsAdding(false); }}
              className="p-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl flex items-center transition border border-emerald-200 shadow-xs"
              title="Import Data Siswa (CSV)"
            >
              <Upload className="w-5 h-5" />
            </button>
            <button 
              onClick={() => { setIsAdding(!isAdding); setIsImporting(false); }}
              className="px-3.5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl flex items-center space-x-1.5 transition shadow-xs text-xs font-bold"
              title="Tambah Siswa Manual"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Siswa</span>
            </button>
          </div>
        </div>

        {/* Kotak Pencarian */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            placeholder="Cari nama siswa, kelas, atau ID kelas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* 2. Modal/Panel Form Tambah Siswa Manual */}
      {isAdding && (
        <div className="flex-none bg-blue-50/50 p-4 sm:p-5 border-b border-blue-200 animate-in slide-in-from-top-2 duration-150">
          <div className="max-w-2xl mx-auto bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-md">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                <Plus className="w-4 h-4 text-primary-600" />
                <span>Tambah Data Siswa</span>
              </h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              {/* Field: Nama Siswa */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Nama Siswa
                </label>
                <input 
                  required 
                  value={studentName} 
                  onChange={e => setStudentName(e.target.value)} 
                  type="text" 
                  className="w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition" 
                  placeholder="Contoh: Ari"
                />
              </div>

              {/* Mode Pilihan Kelas / ID Kelas */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Kelas & ID Kelas
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomClass(!isCustomClass)}
                    className="text-[11px] text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    {isCustomClass ? "← Pilih dari kelas yang sudah ada" : "+ Masukkan kelas/ID baru"}
                  </button>
                </div>

                {!isCustomClass ? (
                  /* Pilih Kelas & ID Kelas yang sudah ada */
                  <select 
                    value={selectedClassId} 
                    onChange={e => setSelectedClassId(e.target.value)} 
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white font-medium focus:ring-2 focus:ring-primary-500"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} • (ID: {c.id}) • Tingkat {c.grade}
                      </option>
                    ))}
                  </select>
                ) : (
                  /* Masukkan Nama Kelas & ID Baru */
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input 
                        type="text"
                        value={customClassName}
                        onChange={e => setCustomClassName(e.target.value)}
                        placeholder="Nama Kelas (Contoh: 7 A)"
                        className="w-full border border-slate-200 bg-white rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                      />
                    </div>
                    <div>
                      <select
                        value={customGrade}
                        onChange={e => setCustomGrade(e.target.value)}
                        className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm outline-none font-medium"
                      >
                        <option value="7">Tingkat 7</option>
                        <option value="8">Tingkat 8</option>
                        <option value="9">Tingkat 9</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Tombol Simpan */}
              <div className="flex space-x-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)} 
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal/Panel Impor CSV */}
      {isImporting && (
        <div className="flex-none bg-emerald-50/50 p-4 sm:p-5 border-b border-emerald-200 animate-in slide-in-from-top-2 duration-150">
          <div className="max-w-2xl mx-auto bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-md">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Import Data Siswa (CSV)</span>
              </h3>
              <button onClick={() => setIsImporting(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">Format kolom CSV: <strong>Nama, Kelas, ID Kelas</strong> (tanpa NIS).</p>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                onClick={handleDownloadTemplate}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border border-slate-200 transition"
              >
                <Download className="w-4 h-4" />
                <span>Download Template CSV</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Pilih File CSV</span>
              </button>
            </div>

            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
          </div>
        </div>
      )}

      {/* 4. Area Tabel Siswa Sticky View (Scroll Container dengan Sticky thead) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse table-fixed">
            {/* STICKY THEAD: Menempel di atas saat tabel discroll */}
            <thead className="sticky top-0 z-20 bg-slate-100 border-b border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <tr className="text-slate-700 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-2 text-center w-12 sm:w-16 border-r border-slate-200">
                  NO
                </th>
                <th className="py-3 px-3 sm:px-4">
                  NAMA
                </th>
                <th className="py-3 px-2 sm:px-3 text-center w-28 sm:w-36 border-l border-slate-200 bg-blue-50/60 text-blue-900">
                  KELAS
                </th>
                <th className="py-3 px-2 sm:px-3 text-center w-24 sm:w-32 border-l border-slate-200 bg-slate-200/50 text-slate-800">
                  ID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredStudents.map((student, index) => {
                const studentClass = classes.find(c => c.id === student.class_id || c.name === student.class_id);
                const classNameDisplay = studentClass ? studentClass.name : (student.class_id || '-');
                const classIdDisplay = studentClass ? studentClass.id : (student.class_id || '-');

                return (
                  <tr 
                    key={student.id} 
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Nomor Urut */}
                    <td className="py-3 px-2 text-center font-semibold text-slate-400 text-xs border-r border-slate-100">
                      {index + 1}
                    </td>

                    {/* Nama Siswa */}
                    <td className="py-3 px-3 sm:px-4 font-bold text-slate-800 uppercase tracking-wide truncate">
                      {student.name}
                    </td>

                    {/* Nama Kelas (Contoh: 7 A) */}
                    <td className="py-3 px-2 sm:px-3 text-center border-l border-slate-100 font-bold text-blue-700 bg-blue-50/20 truncate">
                      {classNameDisplay}
                    </td>

                    {/* ID Kelas (Contoh: c1) */}
                    <td className="py-3 px-2 sm:px-3 text-center border-l border-slate-100 font-mono text-[11px] text-slate-500 bg-slate-50/40 truncate">
                      {classIdDisplay}
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 text-xs">
                    {search ? 'Siswa tidak ditemukan untuk pencarian ini.' : 'Belum ada data siswa. Silakan tambahkan siswa.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
