'use client';
import { useState, useEffect } from 'react';
import { getStats } from '@/app/actions';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Calendar as CalendarIcon, Copy, X, CheckCircle } from 'lucide-react';
import styles from './Tracker.module.css';

export default function StatsView() {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [stats, setStats] = useState({ 
    win: { count: 0, tasks: [] }, 
    lose: { count: 0, tasks: [] }, 
    cancelled: { count: 0, tasks: [] }, 
    complete: { count: 0, tasks: [] } 
  });
  const [loading, setLoading] = useState(true);
  const [detailStatus, setDetailStatus] = useState(null); // 'win', 'lose', etc.
  const [copied, setCopied] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    // Use start of startDay and end of endDay
    const start = startOfDay(new Date(startDate)).toISOString();
    const end = endOfDay(new Date(endDate)).toISOString();
    const data = await getStats(start, end);
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

  const handleCopy = () => {
    if (!detailStatus) return;
    const text = stats[detailStatus].tasks.map(t => {
      const date = format(new Date(t.closed_date), 'MMM do');
      const desc = t.description ? ` - ${t.description}` : '';
      return `${date}: ${t.title}${desc}`;
    }).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'win': return 'Wins';
      case 'lose': return 'Losses';
      case 'cancelled': return 'Cancelled';
      case 'complete': return 'Completed';
      default: return status;
    }
  };

  return (
    <div className={styles.mainCard} style={{ minHeight: '400px' }}>
      <div className={styles.navRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <CalendarIcon size={20} style={{ opacity: 0.5 }} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Performance Lookup</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input 
            type="date" 
            className={styles.input} 
            style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span style={{ opacity: 0.3 }}>to</span>
          <input 
            type="date" 
            className={styles.input} 
            style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.statsGrid} style={{ padding: '2.5rem' }}>
        {['win', 'complete', 'lose', 'cancelled'].map((status) => (
          <div 
            key={status}
            className={styles.statCard} 
            style={{ borderBottom: `4px solid var(--status-${status})`, cursor: 'pointer' }}
            onClick={() => setDetailStatus(status)}
          >
            <div className={styles.statValue} style={{ 
              color: `var(--status-${status})`, 
              textShadow: `0 0 20px var(--status-${status})44` 
            }}>
              {stats[status]?.count || 0}
            </div>
            <div className={styles.statLabel}>{getStatusLabel(status)}</div>
          </div>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>Updating stats...</div>
      )}

      {/* Detail Modal */}
      {detailStatus && (
        <div className={styles.modalOverlay} onClick={() => setDetailStatus(null)}>
          <div className={`${styles.modalContent} glass`} onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.taskDate} style={{ color: `var(--status-${detailStatus})` }}>
                  {getStatusLabel(detailStatus)}
                </div>
                <h2 className={styles.taskTitle}>Task Details</h2>
              </div>
              <button 
                onClick={handleCopy} 
                className={styles.iconButton} 
                title="Copy all titles"
                style={{ color: copied ? 'var(--status-complete)' : 'inherit' }}
              >
                {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
              </button>
            </div>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto', margin: '1.5rem 0', paddingRight: '0.5rem' }}>
              {stats[detailStatus].tasks.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {stats[detailStatus].tasks.map((task) => (
                    <div key={task.id} style={{ 
                      padding: '1rem', 
                      background: 'rgba(255, 255, 255, 0.03)', 
                      borderRadius: '12px',
                      borderLeft: `3px solid var(--status-${detailStatus})`
                    }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{task.title}</div>
                      {task.description && (
                        <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.2rem' }}>
                          {task.description}
                        </div>
                      )}
                      <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.4rem' }}>
                        {format(new Date(task.closed_date), 'MMM do, h:mm a')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', opacity: 0.5 }}>No tasks found for this status.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
