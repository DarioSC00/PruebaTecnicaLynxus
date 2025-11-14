"use client";

import React, { useEffect, useState } from "react";
import styles from "./projectPage.module.css";
import * as projectService from "./projectService/projectService";
import TaskDetail from "../taskComponents/taskDetail"; // ajustar si la ruta difiere
import ProjectDetail from "./detailProject";
import TaskCreate from "../taskComponents/taskCreateComponent";
import ProjectCreateComponent from "./projectCreateComponent";
import AddMembersModal from "./addMembersModal";

// Tipos concretos para evitar `any`
type Task = {
  id: number;
  title: string;
  description?: string;
  status: "todo" | "doing" | "done" | string;
  priority: "low" | "medium" | "high" | string;
  due_date?: string | null;
  assignee_id?: number | null;
};

type ProjectItem = {
  id: number;
  name: string;
  description?: string;
  archived?: boolean;
  created_at?: string;
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

  // states for project modals / create task
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [projectDetailOpen, setProjectDetailOpen] = useState(false);
  const [taskCreateOpenFor, setTaskCreateOpenFor] = useState<number | null>(null);
  const [addMembersOpenFor, setAddMembersOpenFor] = useState<number | null>(null);
  const reloadTasksFor = async (projectId?: number) => {
    if (!projectId) return;
    try {
      setTasksLoading((s) => ({ ...s, [projectId]: true }));
      const res = await projectService.getProject(projectId);
      const tasks: Task[] = (res?.tasks ?? []) as Task[];
      setTasksByProject((s) => ({ ...s, [projectId]: tasks }));
    } catch (err) {
      console.error("Error reloading project tasks:", err);
    } finally {
      setTasksLoading((s) => ({ ...s, [projectId]: false }));
    }
  };

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

  type TaskCreateProps = {
    projectId: number;
    defaultOpen?: boolean;
    open?: boolean;
    onCreated?: () => void;
    onClose?: () => void;
  };
  // castea el componente para evitar el error de IntrinsicAttributes
  const TaskCreateModal = TaskCreate as unknown as React.ComponentType<TaskCreateProps>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerRow}>
        <div>
          <h2>Projects</h2>
          <div className={styles.subtitle}>{projects.length} project(s)</div>
        </div>
        <ProjectCreateComponent onCreated={() => window.location.reload()} />
      </div>

      {loading ? (
        <div className={styles.loadingState}>Loading projects…</div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <div>Project</div>
            <div>Status</div>
            <div>Created</div>
            <div>Actions</div>
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
                      {/* ahora el nombre es un botón que abre el detail del proyecto */}
                      <button
                        className={styles.projectTitleBtn}
                        onClick={() => {
                          setSelectedProjectId(p.id);
                          setProjectDetailOpen(true);
                        }}
                        aria-label={`Abrir detalle del proyecto ${p.name}`}
                      >
                        <div className={styles.projectTitle}>{p.name}</div>
                        <div className={styles.projectDesc}>{p.description}</div>
                      </button>
                    </div>
                  </div>

                  <div className={styles.center}>{p.archived ? "Archived" : "Active"}</div>
                  <div className={styles.center}>
                    {p.created_at ? new Date(p.created_at).toLocaleString() : "-"}
                  </div>
                  <div className={`${styles.center} ${styles.actionsCell}`}>
                    <div className={styles.actionsRow}>
                      <button
                        title="Add task"
                        className={styles.iconBtn}
                        onClick={(e) => { e.stopPropagation(); setTaskCreateOpenFor(p.id); }}
                        aria-label={`Create task in project ${p.name}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 5v14"></path>
                          <path d="M5 12h14"></path>
                        </svg>
                      </button>

                      <button
                        title="Add members"
                        className={styles.iconBtn}
                        onClick={(e) => { e.stopPropagation(); setAddMembersOpenFor(p.id); }}
                        aria-label={`Add members to ${p.name}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* tasks panel */}
                {expanded[p.id] && (
                  <div id={`project-tasks-${p.id}`} className={styles.tasksPanel}>
                    {tasksLoading[p.id] ? (
                      <div>Loading tasks…</div>
                    ) : (tasksByProject[p.id] || []).length === 0 ? (
                      <div className={styles.emptyState}>No tasks</div>
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

      {/* Project detail modal */}
      {selectedProjectId !== null && (
        <ProjectDetail
          projectId={selectedProjectId}
          open={projectDetailOpen}
          onClose={() => {
            setProjectDetailOpen(false);
            setSelectedProjectId(null);
          }}
        />
      )}

      {/* Create task modal (por proyecto) */}
      {taskCreateOpenFor !== null && (
        <TaskCreateModal
          projectId={taskCreateOpenFor}
          open={true}
          onCreated={() => {
            // expandir panel y recargar tareas del proyecto
            setExpanded((s) => ({ ...s, [taskCreateOpenFor]: true }));
            reloadTasksFor(taskCreateOpenFor);
            setTaskCreateOpenFor(null);
          }}
          onClose={() => setTaskCreateOpenFor(null)}
        />
      )}

      {/* Add Members modal */}
      {addMembersOpenFor !== null && (
        <AddMembersModal
          projectId={addMembersOpenFor}
          open={true}
          onClose={() => setAddMembersOpenFor(null)}
          onMemberAdded={() => {
            // Opcional: recargar proyecto si necesitas actualizar la lista
          }}
        />
      )}

      {/* TaskDetail modal */}
      {selectedTaskId !== null && (
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