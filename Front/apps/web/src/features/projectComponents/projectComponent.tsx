"use client";

import React, { useEffect, useState } from "react";
import styles from "./projectPage.module.css";
import * as projectService from "./projectService/projectService";
import TaskDetail from "../../features/taskComponents/taskDetail"; // ajustar si la ruta difiere

// Tipos concretos para evitar `any`
type Task = {
  id: number;
  title: string;
  description?: string;
  status: "todo" | "doing" | "done" | string;
  priority: "low" | "med" | "high" | string;
  due_date?: string | null;
  assignee_id?: number | null;
};

type ProjectItem = {
  id: number;
  name: string;
  description?: string;
  archived?: boolean;
  owner?: { id: number; name?: string; email?: string } | null;
  owner_id?: number;
  tasks?: Task[]; // ahora tipado
};

type Paginated<T> = {
  items: T[];
  total?: number;
  page?: number;
  page_size?: number;
};

type ServiceFunc = (...args: unknown[]) => Promise<unknown>;

export default function ProjectList() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [tasksByProject, setTasksByProject] = useState<Record<number, Task[]>>({});
  const [tasksLoading, setTasksLoading] = useState<Record<number, boolean>>({});
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // Tipado seguro para el service
        const svc = projectService as unknown as Record<string, ServiceFunc>;
        let res: unknown;

        if (typeof svc.listProjects === "function") {
          res = await svc.listProjects();
        } else if (typeof svc.list === "function") {
          res = await svc.list();
        } else if (typeof svc.getProjects === "function") {
          res = await svc.getProjects();
        } else {
          throw new Error(
            "projectService no exporta listProjects, list ni getProjects. Revisa los nombres exportados."
          );
        }

        // Normalizar respuesta a ProjectItem[]
        let items: ProjectItem[] = [];
        if (Array.isArray(res)) {
          items = res as ProjectItem[];
        } else if (res && typeof res === "object" && "items" in (res as object)) {
          items = (res as Paginated<ProjectItem>).items ?? [];
        } else {
          items = [];
        }

        setProjects(items);
      } catch (err) {
        console.error("Error loading projects:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleExpand = async (projectId: number) => {
    const isOpen = !!expanded[projectId];
    setExpanded((s) => ({ ...s, [projectId]: !isOpen }));

    if (!isOpen && !tasksByProject[projectId]) {
      try {
        setTasksLoading((s) => ({ ...s, [projectId]: true }));
        const res = await projectService.getProject(projectId);
        const tasks: Task[] = (res?.tasks ?? []) as Task[];
        setTasksByProject((s) => ({ ...s, [projectId]: tasks }));
      } catch (err) {
        console.error("Error loading project tasks:", err);
        setTasksByProject((s) => ({ ...s, [projectId]: [] }));
      } finally {
        setTasksLoading((s) => ({ ...s, [projectId]: false }));
      }
    }
  };

  const openTask = (taskId: number) => {
    setSelectedTaskId(taskId);
    setTaskModalOpen(true);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerRow}>
        <div>
          <h2>Proyectos</h2>
          <div className={styles.subtitle}>{projects.length} proyecto(s)</div>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingState}>Cargando proyectos…</div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <div>Proyecto</div>
            <div>Estado</div>
            <div>Creado</div>
            <div>Acciones</div>
          </div>

          <div>
            {projects.map((p) => (
              <div key={p.id} className={styles.tableRow}>
                <div className={styles.rowContent}>
                  <div className={styles.projectInfo}>
                    <button
                      className={styles.expandBtn}
                      onClick={() => toggleExpand(p.id)}
                      aria-expanded={!!expanded[p.id]}
                      aria-controls={`project-tasks-${p.id}`}
                    >
                      {expanded[p.id] ? "▾" : "▸"}
                    </button>
                    <div>
                      <div className={styles.projectTitle}>{p.name}</div>
                      <div className={styles.projectDesc}>{p.description}</div>
                    </div>
                  </div>

                  <div className={styles.center}>{p.archived ? "Archivado" : "Activo"}</div>
                  <div className={styles.center}>
                    {p.owner?.name || p.owner?.email || "-"}
                  </div>
                  <div className={styles.center}>
                    <button className={styles.linkBtn} onClick={() => toggleExpand(p.id)}>
                      Ver tareas
                    </button>
                  </div>
                </div>

                {/* tasks panel */}
                {expanded[p.id] && (
                  <div id={`project-tasks-${p.id}`} className={styles.tasksPanel}>
                    {tasksLoading[p.id] ? (
                      <div>Cargando tareas…</div>
                    ) : (tasksByProject[p.id] ?? []).length === 0 ? (
                      <div className={styles.emptyState}>No hay tareas</div>
                    ) : (
                      <ul className={styles.taskList}>
                        {(tasksByProject[p.id] ?? []).map((t: Task) => (
                          <li key={t.id} className={styles.taskItem}>
                            <div>
                              <button className={styles.taskLink} onClick={() => openTask(t.id)}>
                                {t.title}
                              </button>
                              <div className={styles.metaSmall}>{t.status} — {t.priority}</div>
                            </div>
                            <div className={styles.taskRight}>
                              <div className={styles.metaSmall}>{t.due_date ? new Date(t.due_date).toLocaleDateString() : "-"}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TaskDetail modal */}
      {selectedTaskId && (
        <TaskDetail
          taskId={selectedTaskId}
          open={taskModalOpen}
          onClose={() => {
            setTaskModalOpen(false);
            setSelectedTaskId(null);
          }}
        />
      )}
    </div>
  );
}