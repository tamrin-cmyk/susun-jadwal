import React, { useState } from 'react';
import { Subject } from '../types';
import { Plus, Edit2, Trash2, BookOpen, Save, X, Sparkles } from 'lucide-react';

interface SubjectViewProps {
  subjects: Subject[];
  onAdd: (subject: Subject) => void;
  onUpdate: (subject: Subject) => void;
  onDelete: (id: string) => void;
}

export default function SubjectView({ subjects, onAdd, onUpdate, onDelete }: SubjectViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Subject, 'id'>>({
    code: '',
    name: '',
    kelompok: 'C',
    totalJP: 4
  });

  const resetForm = () => {
    setFormData({ code: '', name: '', kelompok: 'C', totalJP: 4 });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleEdit = (subject: Subject) => {
    setIsEditing(true);
    setCurrentId(subject.id);
    setFormData({
      code: subject.code,
      name: subject.name,
      kelompok: subject.kelompok,
      totalJP: subject.totalJP
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && currentId) {
      onUpdate({ id: currentId, ...formData });
    } else {
      onAdd({ id: `sub-${Date.now()}`, ...formData });
    }
    resetForm();
  };

  return (
    <div id="subject-view-container" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Card (1/3 Width) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 h-fit">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center">
          {isEditing ? (
            <>
              <Edit2 className="w-4 h-4 mr-2 text-indigo-600" />
              Edit Mata Pelajaran
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2 text-indigo-600" />
              Tambah Mata Pelajaran
            </>
          )}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Kode Mapel</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="e.g., ANI, DGP"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Mata Pelajaran</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="e.g., Animasi 2D & 3D"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Kelompok Kurikulum</label>
            <select
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={formData.kelompok}
              onChange={(e) => setFormData({ ...formData, kelompok: e.target.value as any })}
            >
              <option value="A">Kelompok A (Muatan Nasional)</option>
              <option value="B">Kelompok B (Muatan Kewilayahan)</option>
              <option value="C">Kelompok C (Kejuruan / Produktif DKV)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Standar Alokasi (JP per Minggu)</label>
            <input
              type="number"
              min={1}
              max={12}
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={formData.totalJP}
              onChange={(e) => setFormData({ ...formData, totalJP: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="flex space-x-2 pt-2">
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center shadow-sm"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {isEditing ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>

      {/* List Card (2/3 Width) */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Daftar Mata Pelajaran</h2>
            <p className="text-xs text-slate-500">Total {subjects.length} mata pelajaran terdaftar.</p>
          </div>
          <div className="flex space-x-2">
            <span className="inline-flex items-center text-[10px] bg-amber-50 text-amber-800 border border-amber-100 px-2 py-0.5 rounded-full font-medium">
              <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
              Kelompok C = Produktif DKV
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/30">
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-4">Kelompok</th>
                <th className="py-3 px-4 text-center">Beban JP</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    Belum ada mata pelajaran. Silakan tambahkan terlebih dahulu.
                  </td>
                </tr>
              ) : (
                subjects.map((subj) => (
                  <tr key={subj.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-mono text-xs font-bold text-indigo-600">{subj.code}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{subj.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      {subj.kelompok === 'C' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-100">
                          Kejuruan DKV (C)
                        </span>
                      ) : subj.kelompok === 'A' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          Nasional (A)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          Kewilayahan (B)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">
                      {subj.totalJP} JP
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end space-x-1.5">
                        <button
                          onClick={() => handleEdit(subj)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus mata pelajaran ${subj.name}?`)) {
                              onDelete(subj.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
