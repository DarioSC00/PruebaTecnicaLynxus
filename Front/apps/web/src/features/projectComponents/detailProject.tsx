"use client";
import React, { useEffect, useState } from "react";
import DetalModal from "../universalComponents/detailUniversalComponents/detailModal";
import TaskCreateComponent from "../taskComponents/taskCreateComponent";
import styles from "./projectPage.module.css";
import * as projectService from "./projectService/projectService";

type UserItem = { id: number; name?: string; email?: string };
type CommentItem = { id: number; body: string; author?: UserItem; created_at?: string };
type TaskItem = {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string | null;
  assignee?: UserItem | null;
  comments?: CommentItem[];
};
type ProjectDetail = {
  id: number;
  name: string;
  description?: string;
  archived?: boolean;
  owner?: UserItem | null;
  owner_id?: number;
  tasks?: TaskItem[];
};

export default function ProjectDetail({
  projectId,
  open,
  onClose,
  onUpdate,
}: {
  projectId: number | null;
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}) {
  const [data, setData] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    const timeout = setTimeout(() => {
      if (mounted) {
        console.warn("[detailProject] request timeout");
        setError("Tiempo de respuesta agotado");
        setLoading(false);
      }
    }, 10000);
    if (!open || projectId == null) {
      clearTimeout(timeout);
      setData(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await projectService.getProject(projectId);
        console.log("[detailProject] raw project:", res);
        if (!mounted) return;
        setData(res as ProjectDetail);
      } catch (err) {
        console.error("[detailProject] error fetching project:", err);
        if (!mounted) return;
        setError("No se pudo cargar el proyecto");
      } finally {
        if (mounted) setLoading(false);
        clearTimeout(timeout);
      }
    })();

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [open, projectId, reloadKey]);

  return (
    <DetalModal open={open} onClose={onClose} title={data?.name ?? "Detalle proyecto"} data={data}>
      {loading ? (
        <p className={styles.center}>Cargando…</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : !data ? (
        <p className={styles.meta}>Sin datos</p>
      ) : (
        <div>
          <p className={styles.projectDescription}>{data.description ?? "-"}</p>

          <div className={styles.keyValue}>
            <div className={styles.key}>Propietario</div>
            <div className={styles.value}>
              {data.owner?.name ?? data.owner?.email ?? (data.owner_id ? `#${data.owner_id}` : "-")}
            </div>
          </div>

          <div className={styles.keyValue}>
            <div className={styles.key}>Estado</div>
            <div className={styles.value}>{data.archived ? "Archivado" : "Activo"}</div>
          </div>

          {/* Sección de tareas con botón para crear */}
          <div style={{ marginTop: "1.5rem", borderTop: "1px solid #e5e7eb", paddingTop: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#111827" }}>
                Tareas ({data.tasks?.length ?? 0})
              </h4>
              {projectId && (
                <TaskCreateComponent
                  projectId={projectId}
                  onCreated={() => setReloadKey((k) => k + 1)}
                />
              )}
            </div>

            {!data.tasks || data.tasks.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: "0.875rem", textAlign: "center", padding: "1rem" }}>
                No hay tareas en este proyecto
              </p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {data.tasks.map((t) => (
                  <li
                    key={t.id}
                    style={{
                      padding: "0.75rem",
                      borderBottom: "1px solid #e5e7eb",
                      background: "#f9fafb",
                      borderRadius: "8px",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#111827", marginBottom: "0.25rem" }}>
                      {t.title}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280", display: "flex", gap: "1rem" }}>
                      <span>Estado: {t.status}</span>
                      <span>Prioridad: {t.priority}</span>
                      <span>Responsable: {t.assignee?.name ?? "-"}</span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                      💬 {t.comments?.length ?? 0} comentarios
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </DetalModal>
  );
}