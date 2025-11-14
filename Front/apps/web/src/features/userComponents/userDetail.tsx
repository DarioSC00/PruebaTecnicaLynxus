"use client";

import React, { useEffect, useState } from "react";
import DetalModal from "../universalComponents/detailUniversalComponents/detailModal";
import * as userService from "./userService/userService";
import styles from "./userPage.module.css";

type UserDetailType = userService.UserDetail;
type ProjectItem = { id: number; name: string; description?: string };

// Helper seguro para obtener clases desde CSS modules
function getStyle(stylesObj: Record<string,string>, key: string) {
  return (stylesObj as Record<string,string>)[key] ?? "";
}

export default function UserDetail({ 
  userId, 
  open, 
  onClose 
}: { 
  userId: number | null; 
  open: boolean; 
  onClose: () => void; 
}) {
  const [data, setData] = useState<UserDetailType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!open || userId == null) {
      if (mounted) { 
        setData(null); 
        setError(null); 
        setLoading(false); 
      }
      return;
    }

    React.startTransition(() => setLoading(true));
    (async () => {
      try {
        const user = await userService.getUser(userId);
        if (!mounted) return;
        React.startTransition(() => {
          setData(user);
          setError(null);
        });
      } catch (e) {
        if (!mounted) return;
        console.error("Error loading user:", e);
        setError("Could not load user");
      } finally {
        if (mounted) React.startTransition(() => setLoading(false));
      }
    })();

    return () => { mounted = false; };
  }, [open, userId]);

  return (
    <DetalModal 
      open={open} 
      onClose={onClose} 
      title="User Information"
      data={data}
      render={(user) => {
        if (loading) return <p className={styles.loadingText}>Loading information...</p>;
        if (error) return <p className={styles.errorText}>{error}</p>;
        if (!user) return <p className={styles.emptyText}>No data available</p>;

        return (
          <div className={styles.detailContent}>
            {/* User basic information */}
            <div className={styles.detailSection}>
              <h3 className={styles.sectionTitle}>User Data</h3>
              
              <div className={styles.detailGrid}>
                <div className={styles.detailField}>
                  <label className={styles.fieldLabel}>Full name</label>
                  <p className={styles.fieldValue}>{user.name ?? "No name"}</p>
                </div>

                <div className={styles.detailField}>
                  <label className={styles.fieldLabel}>Email address</label>
                  <p className={styles.fieldValue}>{user.email ?? "-"}</p>
                </div>

                <div className={styles.detailField}>
                  <label className={styles.fieldLabel}>Registration date</label>
                  <p className={styles.fieldValue}>
                    {user.created_at 
                      ? new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : "Not available"
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* User projects (if backend returns them) */}
            {user.projects && user.projects.length > 0 && (
              <div className={styles.detailSection}>
                <h3 className={styles.sectionTitle}>Projects ({user.projects.length})</h3>
                <ul className={styles.projectList}>
                  {user.projects.map((project: ProjectItem) => (
                    <li key={project.id} className={styles.projectItem}>
                      <div className={styles.projectName}>{project.name}</div>
                      {project.description && (
                        <div className={styles.projectDesc}>{project.description}</div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Assigned tasks (if backend returns them) */}
            {user.tasks && user.tasks.length > 0 && (
              <div className={styles.detailSection}>
                <h3 className={styles.sectionTitle}>Assigned Tasks ({user.tasks.length})</h3>
                <ul className={styles.taskList}>
                  {user.tasks.map((task) => {
                    const statusKey = `status-${task.status}`;
                    const priorityKey = `priority-${task.priority}`;
                    return (
                      <li key={task.id} className={styles.taskItem}>
                        <div className={styles.taskTitle}>{task.title}</div>
                        <div className={styles.taskMeta}>
                          <span className={`${styles.taskStatus} ${getStyle(styles, statusKey)}`}>
                            {task.status === 'todo' && 'To Do'}
                            {task.status === 'doing' && 'In Progress'}
                            {task.status === 'done' && 'Completed'}
                          </span>
                          <span className={`${styles.taskPriority} ${getStyle(styles, priorityKey)}`}>
                            {task.priority === 'low' && 'Low'}
                            {task.priority === 'med' && 'Medium'}
                            {task.priority === 'high' && 'High'}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Message if user has no projects or tasks */}
            {(!user.projects || user.projects.length === 0) && 
             (!user.tasks || user.tasks.length === 0) && (
              <div className={styles.emptySection}>
                <p>This user does not have any projects or assigned tasks yet.</p>
              </div>
            )}
          </div>
        );
      }}
    />
  );
}