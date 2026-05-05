'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Ban, Trophy, Undo2, Plus, X, Trash2 } from 'lucide-react';
import { format, addWeeks, subWeeks, startOfWeek } from 'date-fns';
import { addTask, updateTaskStatus, deleteTask, updateTask } from '@/app/actions';
import styles from './Tracker.module.css';
import { motion, AnimatePresence } from 'framer-motion';

export default function WeekView({ currentDate, setCurrentDate, tasks, onTasksUpdated }) {
  const [loading, setLoading] = useState(false);
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
    setDirection(1); 
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    setDirection(-1); 
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
      default: return 'var(--text-secondary)';
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === 'open' && b.status !== 'open') return -1;
    if (a.status !== 'open' && b.status === 'open') return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

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
    <div style={{ position: 'relative', overflow: 'hidden', padding: '1rem 4rem 5.5rem 4rem' }}>
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

          <div className={styles.taskList}>
            {loading ? (
              <p style={{ textAlign: 'center', opacity: 0.5, padding: '3rem' }}>Loading tasks...</p>
            ) : sortedTasks.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>No tasks for this week. Add one below!</p>
            ) : (
              <AnimatePresence mode="popLayout">
                {sortedTasks.map(task => {
                  const isClosed = task.status !== 'open';
                  const statusColor = getStatusColor(task.status);
                  return (
                    <motion.div 
                      key={task.id} 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`${styles.taskItem} ${isClosed ? styles.taskItemCompleted : ''}`}
                      style={{ '--status-color': statusColor }}
                    >
                      <div className={styles.taskContent} onClick={() => openEditModal(task)} style={{ cursor: 'pointer' }}>
                        <div className={styles.taskDate}>
                          {isClosed ? (
                            <>{format(new Date(task.closed_date), 'MMM do')}</>
                          ) : (
                            <>{format(new Date(task.created_at), 'MMM do')}</>
                          )}
                        </div>
                        <div className={styles.taskTitle}>{task.title}</div>
                        {task.description && <div className={styles.taskDescription}>{task.description}</div>}
                      </div>
                      
                      <div className={styles.taskActions}>
                        {!isClosed ? (
                          <>
                            <button className={`${styles.taskBtn} ${styles.btnWin}`} onClick={() => handleStatusChange(task.id, 'win')} title="Win">
                              <Trophy size={16} />
                            </button>
                            <button className={`${styles.taskBtn} ${styles.btnLose}`} onClick={() => handleStatusChange(task.id, 'lose')} title="Lose">
                              <XCircle size={16} />
                            </button>
                            <button className={`${styles.taskBtn} ${styles.btnCancel}`} onClick={() => handleStatusChange(task.id, 'cancelled')} title="Cancel">
                              <Ban size={16} />
                            </button>
                            <button className={`${styles.taskBtn} ${styles.btnComplete}`} onClick={() => handleStatusChange(task.id, 'complete')} title="Complete">
                              <CheckCircle2 size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button className={`${styles.taskBtn} ${styles.btnReopen}`} onClick={() => handleStatusChange(task.id, 'open')} title="Reopen">
                              <Undo2 size={16} />
                            </button>
                            {task.status === 'cancelled' && (
                              <button className={`${styles.taskBtn} ${styles.btnDelete}`} onClick={() => handleDeleteTask(task.id)} title="Delete Permanently">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          <button className={styles.fab} onClick={openAddModal}>
            <Plus size={32} />
          </button>
        </motion.div>
      </AnimatePresence>
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
