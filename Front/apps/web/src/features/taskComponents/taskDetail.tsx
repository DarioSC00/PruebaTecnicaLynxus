"use client";

import React, { useEffect, useState } from "react";
import styles from "./taskPage.module.css";
import * as taskService from "./taskService/taskService";
import * as commentService from "../commentComponents/commentService/commentService";
import type { TaskDetail, CommentItem } from "./taskService/taskService";

// Aceptar onUpdate opcional para que el consumidor pueda pasarlo
type Props = {
  taskId: number;
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
};
// tipar explícitamente como React.FC ayuda en algunas verificaciones de JSX
const TaskDetail: React.FC<Props> = ({ taskId, open, onClose, onUpdate }) => {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [creating, setCreating] = useState(false);

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const t = await taskService.getTask(taskId);
        setTask(t ?? null);
      } catch (err) {
        console.error("Error loading task:", err);
        setTask(null);
      } finally {
        setLoading(false);
      }
    })();
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, taskId]);

  const loadComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await commentService.listComments(taskId);
      // esperar array
      setComments(Array.isArray(res) ? res : (res?.items ?? []));
    } catch (err) {
      console.error("Error loading comments:", err);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim()) return;
    setCreating(true);
    try {
      await commentService.createComment(taskId, { body: newComment });
      setNewComment("");
      await loadComments();
      onUpdate?.(); // notificar cambio al componente padre
    } catch (err) {
      console.error("Error creating comment:", err);
      alert("No se pudo crear el comentario");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Eliminar comentario?")) return;
    try {
      await commentService.deleteComment(commentId);
      setComments((c) => c.filter((x) => x.id !== commentId));
      onUpdate?.(); // notificar cambio al componente padre
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("No se pudo eliminar el comentario");
    }
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="task-detail-title">
      <div className={styles.modal}>
        <header className={styles.modalHeader}>
          <h3 id="task-detail-title">{loading ? "Cargando…" : task?.title ?? "Tarea"}</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">×</button>
        </header>

        <main className={styles.modalBody}>
          {loading ? (
            <div>Cargando detalles…</div>
          ) : task ? (
            <>
              <section className={styles.section}>
                <h4>Información</h4>
                <div className={styles.row}><strong>ID:</strong> #{task.id}</div>
                <div className={styles.row}><strong>Proyecto ID:</strong> #{task.project_id}</div>
                <div className={styles.row}><strong>Asignado a:</strong> {task.assignee?.name ?? task.assignee?.email ?? "-"}</div>
                <div className={styles.row}><strong>Estado:</strong> {task.status}</div>
                <div className={styles.row}><strong>Prioridad:</strong> {task.priority}</div>
                <div className={styles.row}><strong>Vencimiento:</strong> {task.due_date ? new Date(task.due_date).toLocaleString("es-ES") : "-"}</div>
                <div className={styles.row}><strong>Creado:</strong> {task.created_at ? new Date(task.created_at).toLocaleString("es-ES") : "-"}</div>
                <div className={styles.row}><strong>Última actualización:</strong> {task.updated_at ? new Date(task.updated_at).toLocaleString("es-ES") : "-"}</div>
              </section>

              <section className={styles.section}>
                <h4>Descripción</h4>
                <p className={styles.description}>{task.description ?? "-"}</p>
              </section>

              <section className={styles.section}>
                <h4>Comentarios</h4>

                <div className={styles.commentForm}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    rows={3}
                    aria-label="Nuevo comentario"
                  />
                  <div className={styles.formActions}>
                    <button onClick={handleCreateComment} disabled={creating || !newComment.trim()}>
                      {creating ? "Enviando…" : "Comentar"}
                    </button>
                  </div>
                </div>

                {commentsLoading ? (
                  <div>Cargando comentarios…</div>
                ) : comments.length === 0 ? (
                  <div className={styles.emptyState}>Sin comentarios</div>
                ) : (
                  <ul className={styles.commentsList}>
                    {comments.map((c) => (
                      <li key={c.id} className={styles.commentItem}>
                        <div className={styles.commentHeader}>
                          <strong>{c.author?.name ?? "Usuario"}</strong>
                          <span className={styles.commentDate}>{c.created_at ? new Date(c.created_at).toLocaleString("es-ES") : ""}</span>
                        </div>
                        <div className={styles.commentBody}>{c.body}</div>
                        {currentUserId && c.author?.id === currentUserId && (
                          <div className={styles.commentActions}>
                            <button className={styles.deleteCommentBtn} onClick={() => handleDeleteComment(c.id)}>Eliminar</button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          ) : (
            <div>No se encontró la tarea</div>
          )}
        </main>
      </div>
    </div>
  );
}

function getCurrentUserId(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return typeof u?.id === "number" ? u.id : null;
  } catch {
    return null;
  }
}

export default TaskDetail;
