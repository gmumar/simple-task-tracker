'use server';

import db from '@/lib/db';
import { startOfWeek, format } from 'date-fns';

/**
 * Valid statuses: 'open', 'win', 'lose', 'cancelled', 'complete'
 */

// Helper to get formatted week string
export async function getWeekStartString(date = new Date()) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  return format(weekStart, 'yyyy-MM-dd');
}

export async function rolloverMissingTasks(currentWeekStart) {
  // Find tasks that are not closed and are not in the current week
  // If they find a match, copy them to the current week
  const stmtOpenTasks = db.prepare(`
    SELECT * FROM tasks 
    WHERE status = 'open' 
    AND week_start < ?
  `);
  
  const openTasks = stmtOpenTasks.all(currentWeekStart);

  if (openTasks.length > 0) {
    const insertStmt = db.prepare(`
      INSERT INTO tasks (id, title, description, status, week_start, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    // Using crypto.randomUUID() for new IDs so they don't collide
    const transaction = db.transaction((tasks) => {
      for (const t of tasks) {
        insertStmt.run(
          crypto.randomUUID(),
          t.title,
          t.description,
          'open',
          currentWeekStart,
          Date.now()
        );
        // Also close the old task as 'rolled_over' or we could just leave it 'open' in the past week
        // Actually, if we just copy them, they show up as open in the past week too.
        // Let's mark the old one as 'rolled_over' so we don't copy it multiple times?
        // Wait, the prompt says "tasks that were not closed in a week get automatically copied to the next week when the new week is created".
        db.prepare(`UPDATE tasks SET status = 'rolled_over', closed_date = ? WHERE id = ?`).run(Date.now(), t.id);
      }
    });

    transaction(openTasks);
  }
}

export async function getTasksForWeek(weekStart) {
  // If no weekStart, use current week
  const dateStr = weekStart || await getWeekStartString();

  // Let's do lazy rollover when we fetch the CURRENT week
  const currentWeekStr = await getWeekStartString();
  if (dateStr === currentWeekStr) {
    await rolloverMissingTasks(currentWeekStr);
  }
  
  const stmt = db.prepare(`SELECT * FROM tasks WHERE week_start = ? ORDER BY created_at ASC`);
  let tasks = stmt.all(dateStr);

  return tasks;
}

export async function addTask(title, description, weekStart) {
  const ws = weekStart || await getWeekStartString();
  const stmt = db.prepare(`
    INSERT INTO tasks (id, title, description, status, week_start, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(crypto.randomUUID(), title, description || null, 'open', ws, Date.now());
  return true;
}

export async function updateTaskStatus(id, status) {
  const closedDate = status !== 'open' ? Date.now() : null;
  const stmt = db.prepare(`UPDATE tasks SET status = ?, closed_date = ? WHERE id = ?`);
  stmt.run(status, closedDate, id);
  return true;
}

export async function updateTask(id, title, description) {
  const stmt = db.prepare(`UPDATE tasks SET title = ?, description = ? WHERE id = ?`);
  stmt.run(title, description, id);
  return true;
}

export async function deleteTask(id) {
  const stmt = db.prepare(`DELETE FROM tasks WHERE id = ?`);
  stmt.run(id);
  return true;
}

export async function getStats(startDate, endDate) {
  const stmt = db.prepare(`
    SELECT id, title, description, status, closed_date 
    FROM tasks 
    WHERE closed_date BETWEEN ? AND ?
    ORDER BY closed_date DESC
  `);
  const tasks = stmt.all(
    new Date(startDate).getTime(),
    new Date(endDate).getTime()
  );
  
  const stats = { 
    win: { count: 0, tasks: [] }, 
    lose: { count: 0, tasks: [] }, 
    cancelled: { count: 0, tasks: [] }, 
    complete: { count: 0, tasks: [] } 
  };

  for (const task of tasks) {
    if (stats[task.status] !== undefined) {
      stats[task.status].count++;
      stats[task.status].tasks.push(task);
    }
  }
  return stats;
}
