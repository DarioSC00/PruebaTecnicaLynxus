"use client";
import React, { useEffect, useState } from "react";
import DetalModal from "../universalComponents/detailUniversalComponents/detailModal";
import styles from "./projectPage.module.css";
import * as projectService from "./projectService/projectService";
import * as userService from "../userComponents/userService/userService";
import { toast } from "react-toastify";

type UserItem = { id: number; name?: string; email?: string };
type CommentItem = { id: number; body: string; author?: UserItem; created_at?: string };
type ProjectDetail = {
  id: number;
  name: string;
  description?: string;
  archived?: boolean;
  owner?: UserItem | null;
  owner_id?: number;
  members?: UserItem[];
  comments?: CommentItem[];
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
  
  // Comment states
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [creatingComment, setCreatingComment] = useState(false);

  // Member management states
  const [showAddMember, setShowAddMember] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<UserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [addingMember, setAddingMember] = useState(false);

  const currentUserId = getCurrentUserId();
  const isOwner = data && currentUserId && data.owner_id === currentUserId;

  useEffect(() => {
    let mounted = true;
    const timeout = setTimeout(() => {
      if (mounted) {
        console.warn("[detailProject] request timeout");
        const errorMsg = "Request timeout";
        setError(errorMsg);
        toast.error(errorMsg);
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
        const errorMsg = "Could not load project";
        setError(errorMsg);
        toast.error(errorMsg);
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

  // Cargar comentarios del proyecto
  useEffect(() => {
    if (!open || !projectId) {
      setComments([]);
      return;
    }
    loadComments();
  }, [open, projectId, reloadKey]);

  const loadComments = async () => {
    if (!projectId) return;
    setCommentsLoading(true);
    try {
      const res = await projectService.getProjectComments(projectId);
      setComments(Array.isArray(res) ? res : []);
    } catch (err: any) {
      console.error("[detailProject] error loading comments:", err);
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
    if (!newComment.trim() || !projectId) return;
    setCreatingComment(true);
    try {
      await projectService.createProjectComment(projectId, { body: newComment });
      toast.success("Comment created successfully");
      setNewComment("");
      await loadComments();
      onUpdate?.();
    } catch (err) {
      console.error("[detailProject] error creating comment:", err);
      toast.error("Could not create comment");
    } finally {
      setCreatingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Delete comment?")) return;
    try {
      await projectService.deleteProjectComment(commentId);
      toast.success("Comment deleted successfully");
      setComments((c) => c.filter((x) => x.id !== commentId));
      onUpdate?.();
    } catch (err) {
      console.error("[detailProject] error deleting comment:", err);
      toast.error("Could not delete comment");
    }
  };

  // Member management functions
  const loadAvailableUsers = async () => {
    if (!projectId) return;
    setLoadingUsers(true);
    try {
      const result = await userService.listUsers({});
      // Filter out users who are already members
      const memberIds = new Set(data?.members?.map(m => m.id) || []);
      const available = result.items.filter((u: UserItem) => !memberIds.has(u.id));
      setAvailableUsers(available);
    } catch (err) {
      console.error("[detailProject] error loading users:", err);
      toast.error("Could not load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleShowAddMember = () => {
    setShowAddMember(true);
    loadAvailableUsers();
  };

  const handleAddMember = async () => {
    if (!selectedUserId || !projectId) return;
    setAddingMember(true);
    try {
      await projectService.addProjectMember(projectId, selectedUserId);
      toast.success("Member added successfully");
      setShowAddMember(false);
      setSelectedUserId(null);
      setReloadKey(k => k + 1); // Recargar datos del proyecto
      onUpdate?.();
    } catch (err: any) {
      console.error("[detailProject] error adding member:", err);
      toast.error(err?.response?.data?.detail || "Could not add member");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!projectId) return;
    if (!confirm("¿Eliminar este miembro del proyecto?")) return;
    try {
      await projectService.removeProjectMember(projectId, userId);
      toast.success("Member removed successfully");
      setReloadKey(k => k + 1); // Recargar datos del proyecto
      onUpdate?.();
    } catch (err: any) {
      console.error("[detailProject] error removing member:", err);
      toast.error(err?.response?.data?.detail || "Could not remove member");
    }
  };

  return (
    <DetalModal open={open} onClose={onClose} title={data?.name ?? "Project Detail"} data={data}>
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading…</p>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          {error}
        </div>
      ) : !data ? (
        <p className={styles.noData}>No data</p>
      ) : (
        <div className={styles.detailGrid}>
          {/* LEFT COLUMN: Project Information */}
          <div className={styles.leftColumn}>
            {/* Project information section */}
            <div className={styles.descriptionSection}>
              <h3 className={styles.descriptionTitle}>
                📋 Description
              </h3>
              <p className={styles.descriptionText}>
                {data.description || "No description"}
              </p>
            </div>

            {/* Information Grid */}
            <div className={styles.infoGrid}>
            {/* Owner Card */}
            <div className={`${styles.infoCard} ${styles.infoCardOwner}`}>
              <div className={styles.infoCardHeader}>
                <span className={styles.infoCardIcon}>👤</span>
                <span className={`${styles.infoCardLabel} ${styles.infoCardLabelOwner}`}>
                  Owner
                </span>
              </div>
              <div className={`${styles.infoCardValue} ${styles.infoCardValueOwner}`}>
                {data.owner?.name ?? data.owner?.email ?? (data.owner_id ? `User #${data.owner_id}` : "No owner")}
              </div>
            </div>

            {/* Status Card */}
            <div className={`${styles.infoCard} ${data.archived ? styles.infoCardStatusArchived : styles.infoCardStatusActive}`}>
              <div className={styles.infoCardHeader}>
                <span className={styles.infoCardIcon}>
                  {data.archived ? "📦" : "✅"}
                </span>
                <span className={`${styles.infoCardLabel} ${data.archived ? styles.infoCardLabelArchived : styles.infoCardLabelActive}`}>
                  Status
                </span>
              </div>
              <div className={`${styles.infoCardValue} ${data.archived ? styles.infoCardValueArchived : styles.infoCardValueActive}`}>
                {data.archived ? "Archived" : "Active"}
              </div>
            </div>
          </div>

          {/* Project Members Section */}
          <div className={styles.membersSection}>
            <div className={styles.membersHeader}>
              <h4 className={styles.membersTitle}>
              👥 Team Members
              <span className={styles.membersBadge}>
                {data.members?.length || 0}
              </span>
              </h4>
              {isOwner && (
                <button
                  onClick={handleShowAddMember}
                  className={styles.addMemberBtn}
                >
                  ➕ Add Member
                </button>
              )}
            </div>            {data.members && data.members.length > 0 ? (
              <div className={styles.membersList}>
                {data.members.map((member) => (
                  <div key={member.id} className={styles.memberCard}>
                    <div className={styles.memberAvatar}>
                      {(member.name ?? member.email ?? "U")[0].toUpperCase()}
                    </div>
                    <div className={styles.memberInfo}>
                      <div className={styles.memberName}>
                        {member.name ?? member.email ?? `User #${member.id}`}
                      </div>
                      {member.name && member.email && (
                        <div className={styles.memberEmail}>
                          {member.email}
                        </div>
                      )}
                    </div>
                    {isOwner && member.id !== data.owner_id && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className={styles.removeMemberBtn}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noMembersContainer}>
                <div className={styles.noMembersIcon}>👥</div>
                <p className={styles.noMembersText}>
                  No members in this project
                </p>
              </div>
            )}
          </div>
          </div>

          {/* RIGHT COLUMN: Comments */}
          <div className={styles.rightColumn}>
            {/* Project comments section */}
            <div className={styles.commentsSection}>
              <h4 className={styles.commentsTitle}>
              💬 Comments
              <span className={styles.commentsBadge}>
                {comments.length}
              </span>
              </h4>            <div className={styles.commentInputContainer}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="💭 Write a comment about this project..."
                rows={3}
                className={styles.commentTextarea}
              />
              <div className={styles.commentBtnContainer}>
                <button
                  onClick={handleCreateComment}
                  disabled={creatingComment || !newComment.trim()}
                  className={`${styles.commentBtn} ${creatingComment || !newComment.trim() ? styles.commentBtnDisabled : ''}`}
                >
                  {creatingComment ? "📤 Sending…" : "✉️ Comment"}
                </button>
              </div>
            </div>

            {commentsLoading ? (
              <div className={styles.commentsLoadingContainer}>
                <div className={styles.spinner}></div>
                <p className={styles.commentsLoadingText}>Loading comments…</p>
              </div>
            ) : comments.length === 0 ? (
              <div className={styles.noCommentsContainer}>
                <div className={styles.noCommentsIcon}>💬</div>
                <p className={styles.noCommentsTextPrimary}>
                  No comments yet
                </p>
                <p className={styles.noCommentsTextSecondary}>
                  Be the first to comment!
                </p>
              </div>
            ) : (
              <div className={styles.commentsList}>
                {comments.map((c) => (
                  <div key={c.id} className={styles.commentCard}>
                    <div className={styles.commentHeader}>
                      <div className={styles.commentAuthorSection}>
                        <div className={styles.commentAuthorRow}>
                          <div className={styles.commentAvatar}>
                            {(c.author?.name ?? c.author?.email ?? "U")[0].toUpperCase()}
                          </div>
                          <div>
                            <div className={styles.commentAuthorName}>
                              {c.author?.name ?? c.author?.email ?? "User"}
                            </div>
                            <div className={styles.commentTimestamp}>
                              {c.created_at ? new Date(c.created_at).toLocaleString("en-US", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              }) : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                      {currentUserId && c.author?.id === currentUserId && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className={styles.commentDeleteBtn}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                    <div className={styles.commentBody}>
                      {c.body}
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      {/* Modal to add members */}
      {showAddMember && (
        <div className={styles.addMemberModalOverlay} onClick={() => setShowAddMember(false)}>
          <div className={styles.addMemberModalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.addMemberModalTitle}>
              ➕ Add Member to Project
            </h3>
            
            {loadingUsers ? (
              <div className={styles.addMemberModalLoading}>
                Loading users...
              </div>
            ) : availableUsers.length === 0 ? (
              <div className={styles.addMemberModalEmpty}>
                <p className={styles.addMemberModalEmptyText}>
                  No users available to add
                </p>
              </div>
            ) : (
              <>
                <div className={styles.addMemberModalForm}>
                  <label className={styles.addMemberModalLabel}>
                    Select a user:
                  </label>
                  <select
                    value={selectedUserId || ""}
                    onChange={(e) => setSelectedUserId(Number(e.target.value))}
                    className={styles.addMemberModalSelect}
                  >
                    <option value="">-- Select user --</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name ?? user.email} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.addMemberModalActions}>
                  <button
                    onClick={() => setShowAddMember(false)}
                    className={styles.addMemberModalCancelBtn}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMember}
                    disabled={!selectedUserId || addingMember}
                    className={`${styles.addMemberModalAddBtn} ${!selectedUserId || addingMember ? styles.addMemberModalAddBtnDisabled : ''}`}
                  >
                    {addingMember ? "Adding..." : "Add"}
                  </button>
                </div>
              </>
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