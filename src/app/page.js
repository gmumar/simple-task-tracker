'use client';
import { useState, useRef, useEffect } from 'react';
import WeekView from '@/components/WeekView';
import StatsView from '@/components/StatsView';
import ThemeToggle from '@/components/ThemeToggle';
import SpaceBackground from '@/components/SpaceBackground';
import { Download, Upload, BarChart3, CalendarDays } from 'lucide-react';
import { getTasksForWeek } from '@/app/actions';
import { format, startOfWeek } from 'date-fns';
import styles from '@/components/Tracker.module.css';

export default function Home() {
  const [activeTab, setActiveTab] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const fileInputRef = useRef(null);

  const loadTasks = async (date) => {
    const weekStart = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const data = await getTasksForWeek(weekStart);
    setTasks(data);
  };

  useEffect(() => {
    loadTasks(currentDate);
  }, [currentDate]);

  const handleExport = () => {
    window.location.href = '/api/db/export';
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/db/import', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert('Database imported successfully. Reloading...');
        window.location.reload();
      } else {
        alert('Failed to import database.');
      }
    } catch (err) {
      console.error(err);
      alert('Error importing database.');
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header} style={{ position: 'relative' }}>
        <SpaceBackground tasks={tasks} />
        <div className={styles.actions}>
          <button 
            onClick={() => setActiveTab('week')} 
            className={`${styles.iconButton} ${activeTab === 'week' ? styles.iconButtonActive : ''}`}
            title="Week View"
          >
            <CalendarDays size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('stats')} 
            className={`${styles.iconButton} ${activeTab === 'stats' ? styles.iconButtonActive : ''}`}
            title="Stats View"
          >
            <BarChart3 size={20} />
          </button>
          <div style={{ width: '1px', backgroundColor: 'var(--surface-border)', margin: '0 0.5rem' }}></div>
          <button onClick={handleExport} className={styles.iconButton} title="Export Database">
            <Download size={20} />
          </button>
          <button onClick={() => fileInputRef.current?.click()} className={styles.iconButton} title="Import Database">
            <Upload size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            style={{ display: 'none' }} 
            accept=".sqlite"
          />
          <ThemeToggle />
        </div>
      </header>

      {activeTab === 'week' ? (
        <WeekView 
          currentDate={currentDate} 
          setCurrentDate={setCurrentDate} 
          tasks={tasks} 
          onTasksUpdated={() => loadTasks(currentDate)} 
        />
      ) : (
        <StatsView />
      )}
    </main>
  );
}
