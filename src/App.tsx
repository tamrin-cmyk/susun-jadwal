import React, { useState, useEffect } from 'react';
import { 
  SchoolConfig, Subject, Teacher, ClassItem, Assignment, TimeSlot, ScheduleSlot, ActiveTab, ScheduleConflict 
} from './types';
import { 
  defaultSchoolConfig, defaultSubjects, defaultTeachers, defaultClasses, defaultAssignments, defaultTimeSlots, defaultDays 
} from './data/defaultData';
import { checkConflicts } from './utils/schedulerSolver';
import { saveScheduleToCloud, loadScheduleFromCloud } from './lib/firebase';

// Views
import DashboardView from './components/DashboardView';
import ConfigView from './components/ConfigView';
import SubjectView from './components/SubjectView';
import TeacherView from './components/TeacherView';
import ClassView from './components/ClassView';
import AssignmentView from './components/AssignmentView';
import TimeTemplateView from './components/TimeTemplateView';
import GenerateAIView from './components/GenerateAIView';
import PrintView from './components/PrintView';
import TeachingSummaryView from './components/TeachingSummaryView';
import ScheduleEditorView from './components/ScheduleEditorView';

// Icons
import { 
  LayoutDashboard, Settings, BookOpen, Users, Landmark, ClipboardList, Clock, Sparkles, Printer, GraduationCap, Menu, X, AlertTriangle, Cloud, CloudOff, RefreshCw, Calendar 
} from 'lucide-react';

export default function App() {
  // Mobile sidebar toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Core State
  const [config, setConfig] = useState<SchoolConfig>(() => {
    const saved = localStorage.getItem('cordova_v3_school_config');
    return saved ? JSON.parse(saved) : defaultSchoolConfig;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('cordova_v3_subjects');
    return saved ? JSON.parse(saved) : defaultSubjects;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('cordova_v3_teachers');
    return saved ? JSON.parse(saved) : defaultTeachers;
  });

  const [classes, setClasses] = useState<ClassItem[]>(() => {
    const saved = localStorage.getItem('cordova_v3_classes');
    return saved ? JSON.parse(saved) : defaultClasses;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('cordova_v3_assignments');
    return saved ? JSON.parse(saved) : defaultAssignments;
  });

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(() => {
    const saved = localStorage.getItem('cordova_v3_time_slots');
    return saved ? JSON.parse(saved) : defaultTimeSlots;
  });

  const [slots, setSlots] = useState<ScheduleSlot[]>(() => {
    const saved = localStorage.getItem('cordova_v3_schedule_slots');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Firebase Sync State
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastCloudSync, setLastCloudSync] = useState<string | null>(() => {
    return localStorage.getItem('cordova_v3_last_cloud_sync');
  });
  const [firebaseSyncEnabled, setFirebaseSyncEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('cordova_v3_firebase_sync_enabled');
    return saved ? saved === 'true' : true;
  });

  // Sync to LocalStorage on changes
  useEffect(() => {
    localStorage.setItem('cordova_v3_school_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('cordova_v3_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('cordova_v3_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('cordova_v3_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('cordova_v3_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('cordova_v3_time_slots', JSON.stringify(timeSlots));
  }, [timeSlots]);

  useEffect(() => {
    localStorage.setItem('cordova_v3_schedule_slots', JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    localStorage.setItem('cordova_v3_firebase_sync_enabled', String(firebaseSyncEnabled));
  }, [firebaseSyncEnabled]);

  // Firebase Hydration (Load on Mount)
  useEffect(() => {
    async function initCloud() {
      try {
        setIsSyncing(true);
        const cloudData = await loadScheduleFromCloud('cordova_tebo_v3');
        if (cloudData) {
          setConfig(cloudData.config);
          setSubjects(cloudData.subjects);
          setTeachers(cloudData.teachers);
          setClasses(cloudData.classes);
          setAssignments(cloudData.assignments);
          setTimeSlots(cloudData.timeSlots);
          setSlots(cloudData.slots);
          setLastCloudSync(cloudData.updatedAt);
          localStorage.setItem('cordova_v3_last_cloud_sync', cloudData.updatedAt);
        }
      } catch (e) {
        console.warn('Could not hydrate from Firebase on mount, utilizing offline local cached data:', e);
      } finally {
        setIsSyncing(false);
        setIsLoaded(true);
      }
    }
    initCloud();
  }, []);

  // Firebase Auto-Sync Debounced Effect
  useEffect(() => {
    if (!isLoaded || !firebaseSyncEnabled) return;

    const delayDebounceFn = setTimeout(async () => {
      try {
        setIsSyncing(true);
        const dataToSave = {
          config,
          subjects,
          teachers,
          classes,
          assignments,
          timeSlots,
          slots
        };
        await saveScheduleToCloud(dataToSave, 'cordova_tebo_v3');
        const timestamp = new Date().toISOString();
        setLastCloudSync(timestamp);
        localStorage.setItem('cordova_v3_last_cloud_sync', timestamp);
      } catch (e) {
        console.error('Firebase auto-sync failed:', e);
      } finally {
        setIsSyncing(false);
      }
    }, 1500);

    return () => clearTimeout(delayDebounceFn);
  }, [config, subjects, teachers, classes, assignments, timeSlots, slots, isLoaded, firebaseSyncEnabled]);

  // Firebase Manual Sync Actions
  const handleSaveToCloudManual = async (): Promise<boolean> => {
    try {
      setIsSyncing(true);
      const dataToSave = {
        config,
        subjects,
        teachers,
        classes,
        assignments,
        timeSlots,
        slots
      };
      await saveScheduleToCloud(dataToSave, 'cordova_tebo_v3');
      const timestamp = new Date().toISOString();
      setLastCloudSync(timestamp);
      localStorage.setItem('cordova_v3_last_cloud_sync', timestamp);
      return true;
    } catch (e) {
      console.error('Firebase manual save failed:', e);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLoadFromCloudManual = async (): Promise<boolean> => {
    try {
      setIsSyncing(true);
      const cloudData = await loadScheduleFromCloud('cordova_tebo_v3');
      if (cloudData) {
        setConfig(cloudData.config);
        setSubjects(cloudData.subjects);
        setTeachers(cloudData.teachers);
        setClasses(cloudData.classes);
        setAssignments(cloudData.assignments);
        setTimeSlots(cloudData.timeSlots);
        setSlots(cloudData.slots);
        setLastCloudSync(cloudData.updatedAt);
        localStorage.setItem('cordova_v3_last_cloud_sync', cloudData.updatedAt);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Firebase manual load failed:', e);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Conflict calculation
  const conflicts: ScheduleConflict[] = checkConflicts(slots, assignments, teachers, classes);

  // Active days list based on offDays (holidays)
  // Standard days are Monday to Saturday. If a day is in offDays, we filter it out. Sunday is off by default unless removed.
  const activeDays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].filter(
    day => !(config.offDays || ["Minggu"]).includes(day)
  );

  // Total Scheduled Slots helper (occupied slots)
  const totalSlotsScheduled = slots.filter(s => s.assignmentId && s.assignmentId !== 'BREAK').length;

  // Sidebar Menu matching the reference image layout
  const sidebarMenus = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
    { id: 'config', label: 'Konfigurasi Umum', icon: Settings },
    { id: 'subjects', label: 'Mata Pelajaran', icon: BookOpen },
    { id: 'teachers', label: 'Data Guru', icon: Users },
    { id: 'classes', label: 'Data Kelas', icon: Landmark },
    { id: 'assignments', label: 'Beban Penugasan', icon: ClipboardList },
    { id: 'time-templates', label: 'Template Waktu', icon: Clock },
    { id: 'generate-ai', label: 'Generate AI', icon: Sparkles, highlight: true },
    { id: 'schedule-editor', label: 'Edit Jadwal Manual', icon: Calendar },
    { id: 'print', label: 'Cetak Jadwal', icon: Printer },
    { id: 'recap', label: 'Rekap Mengajar', icon: GraduationCap }
  ];

  return (
    <div id="app-root-shell" className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased text-slate-800">
      
      {/* Mobile Top Bar (Hidden on desktop) */}
      <header className="bg-slate-900 text-white p-4 flex items-center justify-between md:hidden shadow-md print:hidden">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 bg-blue-600 rounded-lg text-white">
            <Sparkles className="w-5 h-5" />
          </span>
          <span className="font-bold tracking-tight text-sm">GemiJADWAL</span>
          <span className="text-[9px] bg-indigo-500/30 text-indigo-300 font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider">SMK</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 hover:bg-slate-800 rounded-lg transition"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar (Left Rail - Dark Cosmic Theme matching reference image) */}
      <aside className={`
        bg-[#0f172a] text-slate-300 w-64 shrink-0 flex flex-col justify-between p-4 z-40 border-r border-slate-800/50
        fixed md:sticky top-0 bottom-0 left-0 transition-transform duration-300 ease-in-out print:hidden
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="space-y-6">
          {/* Logo Brand Header */}
          <div className="flex items-center space-x-3 px-2 pt-2 pb-1 border-b border-slate-800/50">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="font-black text-white text-base tracking-tight">GemiJADWAL</span>
              </div>
              <p className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase">ANTI BENTROK</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {sidebarMenus.map((menu) => {
              const Icon = menu.icon;
              const isActive = activeTab === menu.id;
              return (
                <button
                  key={menu.id}
                  onClick={() => {
                    setActiveTab(menu.id as ActiveTab);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                      : menu.highlight 
                        ? 'text-amber-400 hover:bg-slate-800/50 hover:text-amber-300' 
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : menu.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span className="truncate">{menu.label}</span>
                  {menu.highlight && !isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info box - mirrors reference photo exactly */}
        <div className="pt-4 border-t border-slate-800/60 space-y-2 text-[10px]">
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/50 space-y-1">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Jenjang Aktif</span>
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span>{config.jenjang.toUpperCase()}</span>
              <span className="text-emerald-400">● ONLINE</span>
            </div>
          </div>

          <div className="bg-slate-950/30 p-2.5 rounded-lg text-slate-500 font-mono text-center">
            Tahun Ajaran<br />
            <strong className="text-slate-400">{config.tahunAjaran} ({config.semester})</strong>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 z-30 md:hidden transition-opacity"
        />
      )}

      {/* Main Workspace Frame */}
      <main id="app-workspace-body" className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header navbar (Hidden during printing) */}
        <header className="bg-white border-b border-slate-100 py-4 px-6 md:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden shrink-0">
          <div>
            <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">
              {sidebarMenus.find(m => m.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-slate-500">
              {config.jenjang} {config.namaInstansi} Tebo - Kelola Kurikulum Desain Komunikasi Visual (DKV)
            </p>
          </div>

          {/* Quick status board */}
          <div className="flex items-center space-x-3 shrink-0 self-start sm:self-auto">
            {/* Cloud Sync State badge */}
            <div className={`inline-flex items-center text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
              isSyncing 
                ? 'bg-amber-50 text-amber-700 border-amber-100' 
                : firebaseSyncEnabled 
                  ? 'bg-blue-50 text-blue-700 border-blue-100' 
                  : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin text-amber-500" />
              ) : (
                <Cloud className={`w-3.5 h-3.5 mr-1.5 ${firebaseSyncEnabled ? 'text-blue-500' : 'text-slate-400'}`} />
              )}
              {isSyncing ? 'Sinkronisasi...' : firebaseSyncEnabled ? 'Cloud Aktif' : 'Cloud Mati'}
            </div>

            {conflicts.length > 0 && (
              <div className="inline-flex items-center text-xs font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-100">
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                {conflicts.length} Bentrok
              </div>
            )}
            <div className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200">
              TA: {config.tahunAjaran} ({config.semester})
            </div>
          </div>
        </header>

        {/* Dynamic Inner Panel View with generous negative space */}
        <div id="workspace-viewport" className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 print:p-0 bg-slate-50/50">
          
          {activeTab === 'dashboard' && (
            <DashboardView
              config={config}
              subjects={subjects}
              teachers={teachers}
              classes={classes}
              assignments={assignments}
              totalSlotsScheduled={totalSlotsScheduled}
              totalConflicts={conflicts.length}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'config' && (
            <ConfigView
              config={config}
              onSave={(newConfig) => setConfig(newConfig)}
              firebaseSyncEnabled={firebaseSyncEnabled}
              setFirebaseSyncEnabled={setFirebaseSyncEnabled}
              onSaveToCloud={handleSaveToCloudManual}
              onLoadFromCloud={handleLoadFromCloudManual}
              lastCloudSync={lastCloudSync}
              isSyncing={isSyncing}
            />
          )}

          {activeTab === 'subjects' && (
            <SubjectView
              subjects={subjects}
              onAdd={(subj) => setSubjects([...subjects, subj])}
              onUpdate={(subj) => setSubjects(subjects.map(s => s.id === subj.id ? subj : s))}
              onDelete={(id) => {
                setSubjects(subjects.filter(s => s.id !== id));
                setAssignments(assignments.filter(a => a.subjectId !== id));
              }}
            />
          )}

          {activeTab === 'teachers' && (
            <TeacherView
              teachers={teachers}
              activeDays={activeDays}
              onAdd={(teach) => setTeachers([...teachers, teach])}
              onUpdate={(teach) => setTeachers(teachers.map(t => t.id === teach.id ? teach : t))}
              onDelete={(id) => {
                setTeachers(teachers.filter(t => t.id !== id));
                setAssignments(assignments.filter(a => a.teacherId !== id));
              }}
            />
          )}

          {activeTab === 'classes' && (
            <ClassView
              classes={classes}
              teachers={teachers}
              onAdd={(cls) => setClasses([...classes, cls])}
              onUpdate={(cls) => setClasses(classes.map(c => c.id === cls.id ? cls : c))}
              onDelete={(id) => {
                setClasses(classes.filter(c => c.id !== id));
                setAssignments(assignments.filter(a => a.classId !== id));
              }}
            />
          )}

          {activeTab === 'assignments' && (
            <AssignmentView
              assignments={assignments}
              teachers={teachers}
              subjects={subjects}
              classes={classes}
              onAdd={(assign) => setAssignments([...assignments, assign])}
              onUpdate={(assign) => setAssignments(assignments.map(a => a.id === assign.id ? assign : a))}
              onDelete={(id) => setAssignments(assignments.filter(a => a.id !== id))}
            />
          )}

          {activeTab === 'time-templates' && (
            <TimeTemplateView
              timeSlots={timeSlots}
              onAdd={(slot) => setTimeSlots([...timeSlots, slot].sort((a,b) => (a.startTime > b.startTime ? 1 : -1)))}
              onUpdate={(slot) => setTimeSlots(timeSlots.map(s => s.id === slot.id ? slot : s).sort((a,b) => (a.startTime > b.startTime ? 1 : -1)))}
              onDelete={(id) => setTimeSlots(timeSlots.filter(s => s.id !== id))}
              onReset={(defaults) => setTimeSlots(defaults)}
            />
          )}

          {activeTab === 'generate-ai' && (
            <GenerateAIView
              config={config}
              assignments={assignments}
              teachers={teachers}
              subjects={subjects}
              classes={classes}
              timeSlots={timeSlots}
              days={activeDays}
              slots={slots}
              onUpdateSlots={(newSlots) => setSlots(newSlots)}
              conflicts={conflicts}
            />
          )}

          {activeTab === 'schedule-editor' && (
            <ScheduleEditorView
              config={config}
              slots={slots}
              assignments={assignments}
              teachers={teachers}
              subjects={subjects}
              classes={classes}
              timeSlots={timeSlots}
              days={activeDays}
              onUpdateSlots={(newSlots) => setSlots(newSlots)}
              conflicts={conflicts}
            />
          )}

          {activeTab === 'print' && (
            <PrintView
              config={config}
              slots={slots}
              assignments={assignments}
              teachers={teachers}
              subjects={subjects}
              classes={classes}
              timeSlots={timeSlots}
              days={activeDays}
            />
          )}

          {activeTab === 'recap' && (
            <TeachingSummaryView
              slots={slots}
              assignments={assignments}
              teachers={teachers}
              subjects={subjects}
              classes={classes}
            />
          )}

        </div>
      </main>
    </div>
  );
}
