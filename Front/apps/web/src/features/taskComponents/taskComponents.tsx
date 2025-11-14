"use client";

import React, { useEffect, useState } from "react";
import TableUniversal from "../universalComponents/tableUniversalComponents/tableUniversal";
import TaskDetail from "./taskDetail";
import * as taskService from "./taskService/taskService";
import styles from "./taskPage.module.css";

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
      header: "Tarea",
      accessor: (t: taskService.TaskItem) => (
        <div className={styles.taskCell}>
          <div className={styles.taskTitle}>{t.title}</div>
          <div className={styles.taskDescription}>{t.description || "Sin descripción"}</div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Estado",
      accessor: (t: taskService.TaskItem) => (
        <span className={styles.statusBadge} data-status={t.status}>
          {t.status === "todo" ? "Por hacer" : t.status === "doing" ? "En progreso" : "Completado"}
        </span>
      ),
    },
    {
      id: "priority",
      header: "Prioridad",
      accessor: (t: taskService.TaskItem) => (
        <span className={styles.priorityBadge} data-priority={t.priority}>
          {t.priority === "low" ? "Baja" : t.priority === "med" ? "Media" : "Alta"}
        </span>
      ),
    },
    {
      id: "due_date",
      header: "Vencimiento",
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
          <span style={{ color: isOverdue ? "#991b1b" : "#0f172a" }}>
            {formatted} {isOverdue && "⚠️"}
          </span>
        );
      },
    },
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.breadcrumb}>
        <span className={styles.breadcrumbText}>Tareas</span>
      </div>

      <header className={styles.pageHeader}>
        <h2 className={styles.pageCount}>
          {loading ? "Cargando..." : `${tasks.length} tarea${tasks.length !== 1 ? "s" : ""}`}
        </h2>
        <div className={styles.pageActions}>
          <input
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar tareas..."
          />
        </div>
      </header>

      {/* Filtros */}
      <div className={styles.filters}>
        <span className={styles.filterLabel}>Filtros:</span>
        
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as taskService.StatusType | "")}
        >
          <option value="">Todos los estados</option>
          <option value="todo">Por hacer</option>
          <option value="doing">En progreso</option>
          <option value="done">Completado</option>
        </select>

        <select
          className={styles.filterSelect}
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as taskService.PriorityType | "")}
        >
          <option value="">Todas las prioridades</option>
          <option value="low">Baja</option>
          <option value="med">Media</option>
          <option value="high">Alta</option>
        </select>
      </div>

      <div className={styles.pageContent}>
        {loading && <p className={styles.loadingState}>Cargando tareas...</p>}
        {!loading && tasks.length === 0 && (
          <div className={styles.emptyState}>
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p>No hay tareas</p>
            <small>Las tareas se crean dentro de cada proyecto</small>
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
