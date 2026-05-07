'use client';
import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Ban, Trophy, Undo2, Plus, X, Trash2 } from 'lucide-react';
import { format, addWeeks, subWeeks, startOfWeek, differenceInDays } from 'date-fns';
import { addTask, updateTaskStatus, deleteTask, updateTask } from '@/app/actions';
import styles from './Tracker.module.css';
import { motion, AnimatePresence } from 'framer-motion';

export default function WeekView({ currentDate, setCurrentDate, tasks, onTasksUpdated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [direction, setDirection] = useState(0); 

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') handlePrevWeek();
      if (e.key === 'ArrowRight') handleNextWeek();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDate]);

  const handlePrevWeek = () => {
    setDirection(-1); 
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    setDirection(1); 
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    if (editingTask) {
      await updateTask(editingTask.id, title, description);
    } else {
      const weekStart = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      await addTask(title, description, weekStart);
    }
    
    setTitle('');
    setDescription('');
    setShowModal(false);
    setEditingTask(null);
    onTasksUpdated();
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setShowModal(true);
  };

  const handleStatusChange = async (id, status) => {
    await updateTaskStatus(id, status);
    onTasksUpdated();
  };

  const handleDeleteTask = async (id) => {
    await deleteTask(id);
    onTasksUpdated();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'win': return 'var(--status-win)';
      case 'lose': return 'var(--status-lose)';
      case 'cancelled': return 'var(--status-cancelled)';
      case 'complete': return 'var(--status-complete)';
      case 'open': return 'var(--status-open)';
      default: return 'var(--text-secondary)';
    }
  };

  const statuses = [
    { id: 'open', label: 'Open', color: 'var(--status-open)' },
    { id: 'complete', label: 'Complete', color: 'var(--status-complete)' },
    { id: 'win', label: 'Win', color: 'var(--status-win)' },
    { id: 'lose', label: 'Lose', color: 'var(--status-lose)' },
    { id: 'cancelled', label: 'Cancelled', color: 'var(--status-cancelled)' }
  ];

  const tasksByStatus = useMemo(() => {
    const groups = {
      open: [],
      win: [],
      lose: [],
      complete: [],
      cancelled: []
    };
    tasks.forEach(task => {
      if (groups[task.status]) {
        groups[task.status].push(task);
      }
    });
    // Sort each group by date
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    });
    return groups;
  }, [tasks]);

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <>
    <div style={{ position: 'relative', overflow: 'hidden', padding: '1rem 1rem 5.5rem 1rem' }}>
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div 
          key={currentDate.toISOString()}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className={styles.mainCard} 
          style={{ position: 'relative' }}
        >
          <div className={styles.navRow}>
            <button onClick={handlePrevWeek} className={styles.navButton} aria-label="Previous Week">
              <ChevronLeft size={20} />
            </button>
            <span className={styles.currentWeek}>
              Week of {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM do, yyyy')}
            </span>
            <button onClick={handleNextWeek} className={styles.navButton} aria-label="Next Week">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className={styles.board}>
            {statuses.map(status => (
              <div key={status.id} className={styles.column}>
                <div className={styles.columnHeader} style={{ '--column-color': status.color }}>
                  <span className={styles.columnTitle}>{status.label}</span>
                  <span className={styles.columnCount}>{tasksByStatus[status.id].length}</span>
                </div>
                
                <div className={styles.columnTasks}>
                  <AnimatePresence mode="popLayout">
                    {tasksByStatus[status.id].length === 0 ? (
                      <motion.div
                        key="empty"
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        exit={{ opacity: 0 }}
                        style={{ textAlign: 'center', padding: '2rem', fontSize: '0.8rem', fontStyle: 'italic', width: '100%' }}
                      >
                        No tasks
                      </motion.div>
                    ) : (
                      tasksByStatus[status.id].map(task => {
                        const isClosed = task.status !== 'open';
                        const statusColor = getStatusColor(task.status);
                        return (
                          <motion.div 
                            key={task.id} 
                            layout
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            transition={{ 
                              layout: { type: "spring", stiffness: 300, damping: 30 },
                              opacity: { duration: 0.2 },
                              scale: { duration: 0.2 }
                            }}
                            className={styles.taskCard}
                            style={{ '--status-color': statusColor }}
                            onClick={() => openEditModal(task)}
                          >
                          <div className={styles.cardMain}>
                            <div className={styles.taskTitle}>{task.title}</div>
                            {task.description && <div className={styles.taskDescription}>{task.description}</div>}
                            <div className={styles.taskDate}>
                              {isClosed ? (
                                <>
                                  {format(new Date(task.created_at), 'MMM do')} → {format(new Date(task.closed_date), 'MMM do')} 
                                  {' '}({differenceInDays(new Date(task.closed_date), new Date(task.created_at))} days)
                                </>
                              ) : (
                                <>{format(new Date(task.created_at), 'MMM do')}</>
                              )}
                            </div>
                          </div>
                          
                          <div className={styles.taskActionsSide}>
                            {!isClosed ? (
                              <>
                                <button className={`${styles.taskBtn} ${styles.btnComplete}`} onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, 'complete'); }} title="Complete">
                                  <CheckCircle2 size={14} />
                                </button>
                                <button className={`${styles.taskBtn} ${styles.btnWin}`} onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, 'win'); }} title="Win">
                                  <Trophy size={14} />
                                </button>
                                <button className={`${styles.taskBtn} ${styles.btnLose}`} onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, 'lose'); }} title="Lose">
                                  <XCircle size={14} />
                                </button>
                                <button className={`${styles.taskBtn} ${styles.btnCancel}`} onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, 'cancelled'); }} title="Cancel">
                                  <Ban size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button className={`${styles.taskBtn} ${styles.btnReopen}`} onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, 'open'); }} title="Reopen">
                                  <Undo2 size={14} />
                                </button>
                                {task.status === 'cancelled' && (
                                  <button className={`${styles.taskBtn} ${styles.btnDelete}`} onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} title="Delete Permanently">
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>

        </motion.div>
      </AnimatePresence>

      <button className={styles.fab} onClick={openAddModal} title="Add New Task">
        <Plus size={32} />
      </button>
    </div>

    {showModal && (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h3>{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
            <button onClick={() => setShowModal(false)} className={styles.closeBtn}>
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleAddTask} className={styles.modalForm}>
            <input 
              type="text" 
              placeholder="What needs to be done?" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.modalInput}
              autoFocus
            />
            <textarea 
              placeholder="Add details (optional)" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.modalTextarea}
            />
            <button type="submit" className={styles.submitBtn}>
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </form>
        </div>
      </div>
    )}
    </>
  );
}
