"use client";

import React, { useEffect, useState } from "react";
import DetalModal from "../universalComponents/detailUniversalComponents/detailModal";
import * as taskService from "./taskService/taskService";
import * as commentService from "../commentComponents/commentService/commentService";
import type { TaskDetail, CommentItem } from "./taskService/taskService";
import styles from "./taskPage.module.css";
import { toast } from "react-toastify";

// Aceptar onUpdate opcional para que el consumidor pueda pasarlo
type Props = {
  taskId: number;
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
};

const TaskDetailComponent: React.FC<Props> = ({ taskId, open, onClose, onUpdate }) => {
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
        toast.error("Could not load task");
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
    } catch (err: any) {
      console.error("Error loading comments:", err);
      // Si es 404, 403, o 401, simplemente mostrar vacío sin error
      // 401 significa token expirado - usuario puede seguir usando la app, solo sin comentarios
      if (err?.response?.status === 404 || err?.response?.status === 403 || err?.response?.status === 401) {
        setComments([]);
      } else {
        // Solo mostrar error para otros casos (500, network, etc.)
        toast.error("Could not load comments");
        setComments([]);
      }
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim()) return;
    setCreating(true);
    try {
      await commentService.createComment(taskId, { body: newComment });
      toast.success("Comment created successfully");
      setNewComment("");
      await loadComments();
      onUpdate?.(); // notificar cambio al componente padre
    } catch (err) {
      console.error("Error creating comment:", err);
      toast.error("Could not create comment");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Delete comment?")) return;
    try {
      await commentService.deleteComment(commentId);
      toast.success("Comment deleted successfully");
      setComments((c) => c.filter((x) => x.id !== commentId));
      onUpdate?.(); // notify parent component of change
    } catch (err) {
      console.error("Error deleting comment:", err);
      toast.error("Could not delete comment");
    }
  };

  return (
    <DetalModal open={open} onClose={onClose} title={task?.title ?? "Task Detail"} data={task}>
      {loading ? (
        <p className={styles.taskDetailLoading}>Loading…</p>
      ) : !task ? (
        <p className={styles.taskDetailNoData}>Task not found</p>
      ) : (
        <div>
          {/* Task information */}
          <div className={styles.taskInfoContainer}>
            <div className={styles.taskInfoGrid}>
              <div className={styles.taskInfoRow}>
                <strong className={styles.taskInfoLabel}>Project ID:</strong>
                <span>#{task.project_id}</span>
              </div>
              <div className={styles.taskInfoRow}>
                <strong className={styles.taskInfoLabel}>Assigned to:</strong>
                <span>{task.assignee?.name ?? task.assignee?.email ?? "-"}</span>
              </div>
              <div className={styles.taskInfoRow}>
                <strong className={styles.taskInfoLabel}>Status:</strong>
                <span className={`${styles.taskStatusBadge} ${
                  task.status === "done" ? styles.taskStatusDone : 
                  task.status === "doing" ? styles.taskStatusDoing : 
                  styles.taskStatusTodo
                }`}>
                  {task.status === "todo" ? "To Do" : task.status === "doing" ? "In Progress" : "Completed"}
                </span>
              </div>
              <div className={styles.taskInfoRow}>
                <strong className={styles.taskInfoLabel}>Priority:</strong>
                <span className={`${styles.taskPriorityBadge} ${
                  task.priority === "high" ? styles.taskPriorityHigh : 
                  task.priority === "medium" ? styles.taskPriorityMedium : 
                  styles.taskPriorityLow
                }`}>
                  {task.priority === "low" ? "Low" : task.priority === "medium" ? "Medium" : "High"}
                </span>
              </div>
              <div className={styles.taskInfoRow}>
                <strong className={styles.taskInfoLabel}>Due Date:</strong>
                <span>{task.due_date ? new Date(task.due_date).toLocaleString("en-US") : "-"}</span>
              </div>
              <div className={styles.taskInfoRow}>
                <strong className={styles.taskInfoLabel}>Created:</strong>
                <span>{task.created_at ? new Date(task.created_at).toLocaleString("en-US") : "-"}</span>
              </div>
              <div className={styles.taskInfoRow}>
                <strong className={styles.taskInfoLabel}>Updated:</strong>
                <span>{task.updated_at ? new Date(task.updated_at).toLocaleString("en-US") : "-"}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className={styles.taskDescriptionSection}>
              <h4 className={styles.taskDescriptionTitle}>
                Description
              </h4>
              <p className={styles.taskDescriptionText}>
                {task.description}
              </p>
            </div>
          )}

          {/* Comments */}
          <div className={styles.taskCommentsSection}>
            <h4 className={styles.taskCommentsTitle}>
              Comments
            </h4>

            <div className={styles.taskCommentInputContainer}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                className={styles.taskCommentTextarea}
              />
              <div className={styles.taskCommentBtnContainer}>
                <button
                  onClick={handleCreateComment}
                  disabled={creating || !newComment.trim()}
                  className={`${styles.taskCommentBtn} ${creating || !newComment.trim() ? styles.taskCommentBtnDisabled : ''}`}
                >
                  {creating ? "Sending…" : "Comment"}
                </button>
              </div>
            </div>

            {commentsLoading ? (
              <div className={styles.taskCommentsLoading}>
                Loading comments…
              </div>
            ) : comments.length === 0 ? (
              <div className={styles.taskCommentsEmpty}>
                No comments yet
              </div>
            ) : (
              <ul className={styles.taskCommentList}>
                {comments.map((c) => (
                  <li key={c.id} className={styles.taskCommentItem}>
                    <div className={styles.taskCommentHeader}>
                      <div>
                        <strong className={styles.taskCommentAuthor}>
                          {c.author?.name ?? "User"}
                        </strong>
                        <span className={styles.taskCommentDate}>
                          {c.created_at ? new Date(c.created_at).toLocaleString("en-US") : ""}
                        </span>
                      </div>
                      {currentUserId && c.author?.id === currentUserId && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className={styles.taskCommentDeleteBtn}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <div className={styles.taskCommentBody}>
                      {c.body}
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

export default TaskDetailComponent;
