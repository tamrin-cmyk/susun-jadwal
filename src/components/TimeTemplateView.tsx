import React, { useState } from 'react';
import { TimeSlot } from '../types';
import { Plus, Edit2, Trash2, Clock, Save, RotateCcw } from 'lucide-react';
import { defaultTimeSlots } from '../data/defaultData';

interface TimeTemplateViewProps {
  timeSlots: TimeSlot[];
  onAdd: (slot: TimeSlot) => void;
  onUpdate: (slot: TimeSlot) => void;
  onDelete: (id: string) => void;
  onReset: (defaults: TimeSlot[]) => void;
}

export default function TimeTemplateView({
  timeSlots,
  onAdd,
  onUpdate,
  onDelete,
  onReset
}: TimeTemplateViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<TimeSlot, 'id'>>({
    period: 1,
    startTime: '07:15',
    endTime: '08:00',
    isBreak: false,
    label: ''
  });

  const resetForm = () => {
    setFormData({
      period: 1,
      startTime: '07:15',
      endTime: '08:00',
      isBreak: false,
      label: ''
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleEdit = (slot: TimeSlot) => {
    setIsEditing(true);
    setCurrentId(slot.id);
    setFormData({
      period: slot.period,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isBreak: slot.isBreak,
      label: slot.label || ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && currentId) {
      onUpdate({
        id: currentId,
        period: formData.isBreak ? 0 : formData.period,
        startTime: formData.startTime,
        endTime: formData.endTime,
        isBreak: formData.isBreak,
        label: formData.isBreak ? formData.label : undefined
      });
    } else {
      onAdd({
        id: `ts-${Date.now()}`,
        period: formData.isBreak ? 0 : formData.period,
        startTime: formData.startTime,
        endTime: formData.endTime,
        isBreak: formData.isBreak,
        label: formData.isBreak ? formData.label : undefined
      });
    }
    resetForm();
  };

  return (
    <div id="time-template-view" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 h-fit">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center">
          {isEditing ? (
            <>
              <Edit2 className="w-4 h-4 mr-2 text-indigo-600" />
              Edit Slot Waktu
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2 text-indigo-600" />
              Tambah Slot Waktu
            </>
          )}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-4 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <input
              type="checkbox"
              id="isBreak"
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              checked={formData.isBreak}
              onChange={(e) => setFormData({ ...formData, isBreak: e.target.checked })}
            />
            <label htmlFor="isBreak" className="text-xs font-bold text-slate-700 cursor-pointer">
              Ini adalah Jam Istirahat / Rehat
            </label>
          </div>

          {!formData.isBreak && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Jam Pelajaran Ke-</label>
              <input
                type="number"
                min={1}
                max={15}
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: parseInt(e.target.value) || 1 })}
              />
            </div>
          )}

          {formData.isBreak && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Label Istirahat</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="e.g., Istirahat I, Sholat & Makan"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Waktu Mulai</label>
              <input
                type="time"
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Waktu Selesai</label>
              <input
                type="time"
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
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

      {/* List Card */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Struktur Jam Sekolah</h2>
            <p className="text-xs text-slate-500">Definisi durasi jam pelajaran (JP) dan waktu istirahat.</p>
          </div>
          <button
            onClick={() => {
              if (confirm('Kembalikan ke susunan template waktu standar (8 jam pelajaran + 2 istirahat)?')) {
                onReset(defaultTimeSlots);
              }
            }}
            className="inline-flex items-center px-2.5 py-1.5 border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-600 rounded-lg bg-white shadow-sm transition"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Reset Default
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/30">
                <th className="py-3 px-4">Tipe Slot</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4">Rentang Waktu</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {timeSlots.map((slot) => (
                <tr key={slot.id} className={`hover:bg-slate-50/50 transition ${slot.isBreak ? 'bg-amber-50/20' : ''}`}>
                  <td className="py-3 px-4">
                    {slot.isBreak ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-100">
                        Istirahat
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-100">
                        Jam ke-{slot.period}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {slot.isBreak ? slot.label : `Kegiatan Belajar Mengajar (KBM)`}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    <span className="inline-flex items-center text-xs">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end space-x-1.5">
                      <button
                        onClick={() => handleEdit(slot)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Hapus slot waktu ini?')) {
                            onDelete(slot.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
