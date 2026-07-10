import React, { useState } from 'react';
import { Subject } from '../types';
import { Plus, Edit2, Trash2, BookOpen, Save, X, Sparkles, AlertTriangle } from 'lucide-react';
import { Modal, ConfirmDialog } from './ui/Dialog';

interface SubjectViewProps {
  subjects: Subject[];
  onAdd: (subject: Subject) => void;
  onUpdate: (subject: Subject) => void;
  onDelete: (id: string) => void;
}

export default function SubjectView({ subjects, onAdd, onUpdate, onDelete }: SubjectViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Subject, 'id'>>({
    code: '',
    name: '',
    kelompok: 'C',
    totalJP: 4
  });

  // State for deletion
  const [subjectToDelete, setSubjectToDelete] = useState<{ id: string; name: string } | null>(null);

  const resetForm = () => {
    setFormData({ code: '', name: '', kelompok: 'C', totalJP: 4 });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleAddNew = () => {
    resetForm();
    setIsModalOpen(true);
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
    setIsModalOpen(true);
  };

  const handleDeleteClick = (subject: Subject) => {
    setSubjectToDelete({ id: subject.id, name: subject.name });
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (subjectToDelete) {
      onDelete(subjectToDelete.id);
      setSubjectToDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && currentId) {
      onUpdate({ id: currentId, ...formData });
    } else {
      onAdd({ id: `sub-${Date.now()}`, ...formData });
    }
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div id="subject-view-container" className="space-y-6">
      {/* List Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-800">Daftar Mata Pelajaran</h2>
            <p className="text-xs text-slate-500 mt-0.5">Kelola mata pelajaran kurikulum nasional, kewilayahan, dan produktif DKV.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center text-[10px] bg-amber-50 text-amber-800 border border-amber-100 px-2.5 py-1 rounded-full font-medium">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500 animate-pulse" />
              Kelompok C = Produktif DKV
            </span>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah Mapel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/30">
                <th className="py-3.5 px-6">Kode</th>
                <th className="py-3.5 px-6">Mata Pelajaran</th>
                <th className="py-3.5 px-6">Kelompok</th>
                <th className="py-3.5 px-6 text-center">Beban JP</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2.5" />
                    <p className="font-semibold text-slate-600">Belum ada mata pelajaran</p>
                    <p className="text-xs text-slate-400 mt-0.5">Silakan tambahkan mata pelajaran pertama Anda.</p>
                  </td>
                </tr>
              ) : (
                subjects.map((subj) => (
                  <tr key={subj.id} className="hover:bg-slate-50/40 transition">
                    <td className="py-3.5 px-6 font-mono text-xs font-bold text-indigo-600">
                      <span className="bg-indigo-50/60 px-2 py-1 rounded-md border border-indigo-100/40">
                        {subj.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-800">{subj.name}</div>
                    </td>
                    <td className="py-3.5 px-6">
                      {subj.kelompok === 'C' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-100">
                          Kejuruan DKV (C)
                        </span>
                      ) : subj.kelompok === 'A' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          Nasional (A)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          Kewilayahan (B)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-center font-bold text-slate-700">
                      {subj.totalJP} JP
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex justify-end space-x-1.5">
                        <button
                          onClick={() => handleEdit(subj)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(subj)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus"
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

      {/* Elegant Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Kode Mapel</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="e.g., Animasi 2D & 3D"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Kelompok Kurikulum</label>
            <select
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={formData.totalJP}
              onChange={(e) => setFormData({ ...formData, totalJP: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="flex space-x-2 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center shadow-sm"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {isEditing ? 'Simpan Perubahan' : 'Tambah Mapel'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Elegant Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Mata Pelajaran"
        message={`Apakah Anda yakin ingin menghapus mata pelajaran "${subjectToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Mapel"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
}
