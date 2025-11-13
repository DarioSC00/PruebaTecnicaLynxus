"use client";

import React, { useEffect, useState } from "react";
import DetalModal from "../universalComponents/detailUniversalComponents/detailModal";
import * as taskService from "./taskService/taskService";
import * as commentService from "../commentComponents/commentService/commentService";
import styles from "./taskPage.module.css";

type Props = {
  taskId: number | null;
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
};

export default function TaskDetail({ taskId, open, onClose, onUpdate }: Props) {
  const [task, setTask] = useState<taskService.TaskDetail | null>(null);
  const [comments, setComments] = useState<commentService.CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !taskId) return;
    
    let mounted = true;
    setLoading(true);
    
    Promise.all([
      taskService.getTask(taskId),
      commentService.listComments(taskId),
    ])
      .then(([taskData, commentsData]) => {
        if (!mounted) return;
        setTask(taskData);
        setComments(commentsData);
      })
      .catch((err) => {
        console.error("Error loading task details:", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [taskId, open]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const comment = await commentService.createComment(taskId, { body: newComment });
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Error al agregar comentario");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("¿Eliminar este comentario?")) return;

    try {
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Error al eliminar comentario");
    }
  };

  if (!task && !loading) return null;

  const getStatusLabel = (status?: string) => {
    if (status === "todo") return "Por hacer";
    if (status === "doing") return "En progreso";
    if (status === "done") return "Completado";
    return status;
  };

  const getPriorityLabel = (priority?: string) => {
    if (priority === "low") return "Baja";
    if (priority === "med") return "Media";
    if (priority === "high") return "Alta";
    return priority;
  };

  return (
    <DetalModal open={open} onClose={onClose} title="Detalle de Tarea">
      {loading ? (
        <p style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>Cargando...</p>
      ) : task ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Información básica */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <dl className={styles.keyValue}>
              <dt>Título</dt>
              <dd>{task.title}</dd>
            </dl>

            <dl className={styles.keyValue}>
              <dt>Proyecto</dt>
              <dd>Proyecto #{task.project_id}</dd>
            </dl>

            <dl className={styles.keyValue}>
              <dt>Estado</dt>
              <dd>
                <span className={styles.statusBadge} data-status={task.status}>
                  {getStatusLabel(task.status)}
                </span>
              </dd>
            </dl>

            <dl className={styles.keyValue}>
              <dt>Prioridad</dt>
              <dd>
                <span className={styles.priorityBadge} data-priority={task.priority}>
                  {getPriorityLabel(task.priority)}
                </span>
              </dd>
            </dl>

            {task.due_date && (
              <dl className={styles.keyValue}>
                <dt>Fecha límite</dt>
                <dd>
                  {new Date(task.due_date).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </dd>
              </dl>
            )}

            {task.assignee && (
              <dl className={styles.keyValue}>
                <dt>Asignado a</dt>
                <dd>{task.assignee.name || task.assignee.email}</dd>
              </dl>
            )}
          </div>

          {/* Descripción */}
          {task.description && (
            <dl className={styles.keyValue}>
              <dt>Descripción</dt>
              <dd style={{ whiteSpace: "pre-wrap" }}>{task.description}</dd>
            </dl>
          )}

          {/* Comentarios */}
          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "#111827" }}>
              Comentarios ({comments.length})
            </h3>

            {/* Lista de comentarios */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
              {comments.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: "0.875rem", textAlign: "center", padding: "1rem" }}>
                  No hay comentarios aún
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    style={{
                      padding: "1rem",
                      background: "#f9fafb",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "#111827" }}>
                          {comment.author?.name || "Usuario"}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                          {comment.created_at
                            ? new Date(comment.created_at).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        style={{
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.75rem",
                          color: "#ef4444",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          borderRadius: "4px",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        Eliminar
                      </button>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.875rem", color: "#374151", whiteSpace: "pre-wrap" }}>
                      {comment.body}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Formulario de nuevo comentario */}
            <form onSubmit={handleAddComment} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                rows={3}
                style={{
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#6366f1";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                style={{
                  padding: "0.625rem 1rem",
                  background: newComment.trim() ? "#6366f1" : "#e5e7eb",
                  color: newComment.trim() ? "white" : "#9ca3af",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  cursor: newComment.trim() ? "pointer" : "not-allowed",
                  alignSelf: "flex-end",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (newComment.trim()) e.currentTarget.style.background = "#4f46e5";
                }}
                onMouseLeave={(e) => {
                  if (newComment.trim()) e.currentTarget.style.background = "#6366f1";
                }}
              >
                {submitting ? "Enviando..." : "Agregar comentario"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </DetalModal>
  );
}
