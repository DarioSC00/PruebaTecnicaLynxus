"use client";

import React, { useEffect, useState } from "react";
import TableUniversal from "../universalComponents/tableUniversalComponents/tableUniversal";
import TaskDetail from "./taskDetail";
import * as taskService from "./taskService/taskService";
import styles from "./taskPage.module.css";
import { toast } from "react-toastify";

export default function TaskList() {
  const [tasks, setTasks] = useState<taskService.TaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<taskService.StatusType | "">("");
  const [priorityFilter, setPriorityFilter] = useState<taskService.PriorityType | "">("");
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    React.startTransition(() => setLoading(true));
    (async () => {
      try {
        const res = await taskService.listTasks({
          q: query,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          skip: 0,
          limit: 50,
        });
        if (!mounted) return;
        React.startTransition(() => setTasks(res.items));
        console.log("✅ listTasks response:", res);
      } catch (err) {
        console.error("❌ listTasks error:", err);
        toast.error("Error loading tasks");
        if (mounted) React.startTransition(() => setTasks([]));
      } finally {
        if (mounted) React.startTransition(() => setLoading(false));
      }
    })();
    return () => { mounted = false; };
  }, [query, statusFilter, priorityFilter, reloadKey]);

  const columns = [
    {
      id: "task",
      header: "Task",
      accessor: (t: taskService.TaskItem) => (
        <div className={styles.taskCell}>
          <div className={styles.taskTitle}>{t.title}</div>
          <div className={styles.taskDescription}>{t.description || "Sin descripción"}</div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessor: (t: taskService.TaskItem) => (
        <span className={styles.statusBadge} data-status={t.status}>
          {t.status === "todo" ? "To Do" : t.status === "doing" ? "In Progress" : "Completed"}
        </span>
      ),
    },
    {
      id: "priority",
      header: "Priority",
      accessor: (t: taskService.TaskItem) => (
        <span className={styles.priorityBadge} data-priority={t.priority}>
          {t.priority === "low" ? "Low" : t.priority === "medium" ? "Medium" : "High"}
        </span>
      ),
    },
    {
      id: "due_date",
      header: "Due Date",
      accessor: (t: taskService.TaskItem) => {
        if (!t.due_date) return "-";
        const date = new Date(t.due_date);
        const now = new Date();
        const isOverdue = date < now;
        const formatted = date.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        return (
          <span className={isOverdue ? styles.taskDueDateOverdue : styles.taskDueDateNormal}>
            {formatted} {isOverdue && "⚠️"}
          </span>
        );
      },
    },
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.breadcrumb}>
        <span className={styles.breadcrumbText}>Tasks</span>
      </div>

      <header className={styles.pageHeader}>
        <h2 className={styles.pageCount}>
          {loading ? "Loading..." : `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`}
        </h2>
        <div className={styles.pageActions}>
          <input
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks..."
          />
        </div>
      </header>

      {/* Filters */}
      <div className={styles.filters}>
        <span className={styles.filterLabel}>Filters:</span>
        
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as taskService.StatusType | "")}
        >
          <option value="">All statuses</option>
          <option value="todo">To Do</option>
          <option value="doing">In Progress</option>
          <option value="done">Completed</option>
        </select>

        <select
          className={styles.filterSelect}
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as taskService.PriorityType | "")}
        >
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className={styles.pageContent}>
        {loading && <p className={styles.loadingState}>Loading tasks...</p>}
        {!loading && tasks.length === 0 && (
          <div className={styles.emptyState}>
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p>No tasks</p>
            <small>Tasks are created within each project</small>
          </div>
        )}
        {!loading && tasks.length > 0 && (
          <TableUniversal<taskService.TaskItem>
            columns={columns}
            data={tasks}
            loading={loading}
            rowKey={(t) => t.id}
            onRowClick={(t) => {
              setSelectedId(t.id);
              setOpen(true);
            }}
            actions={(t) => (
              <button
                className={styles.btn}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(t.id);
                  setOpen(true);
                }}
              >
                Ver detalles
              </button>
            )}
          />
        )}
      </div>

      {/* TaskDetail modal: solo renderizar si hay un id seleccionado */}
      {selectedId !== null && (
        <TaskDetail
          taskId={selectedId}
          open={open}
          onClose={() => {
            setOpen(false);
            setSelectedId(null);
          }}
          onUpdate={() => setReloadKey((k) => k + 1)}
        />
      )}
    </div>
  );
}
