"use client";

import React, { useEffect, useState } from "react";
import DetalModal from "../universalComponents/detailUniversalComponents/detailModal";
import * as userService from "./userService/userService";
import styles from "./userPage.module.css";

type UserDetailType = userService.UserDetail;
type ProjectItem = { id: number; name: string; description?: string };
type TaskItem = { id: number; title: string; status: 'todo' | 'doing' | 'done'; priority: 'low' | 'medium' | 'high' };

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
        console.error("Error cargando usuario:", e);
        setError("No se pudo cargar el usuario");
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
      title="Información del usuario"
      data={data}
      render={(user) => {
        if (loading) return <p className={styles.loadingText}>Cargando información...</p>;
        if (error) return <p className={styles.errorText}>{error}</p>;
        if (!user) return <p className={styles.emptyText}>No hay datos disponibles</p>;

        return (
          <div className={styles.detailContent}>
            {/* Información básica del usuario */}
            <div className={styles.detailSection}>
              <h3 className={styles.sectionTitle}>Datos del usuario</h3>
              
              <div className={styles.detailGrid}>
                <div className={styles.detailField}>
                  <label className={styles.fieldLabel}>Nombre completo</label>
                  <p className={styles.fieldValue}>{user.name ?? "Sin nombre"}</p>
                </div>

                <div className={styles.detailField}>
                  <label className={styles.fieldLabel}>Correo electrónico</label>
                  <p className={styles.fieldValue}>{user.email ?? "-"}</p>
                </div>

                <div className={styles.detailField}>
                  <label className={styles.fieldLabel}>Fecha de registro</label>
                  <p className={styles.fieldValue}>
                    {user.created_at 
                      ? new Date(user.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : "No disponible"
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Proyectos del usuario (si el backend los devuelve) */}
            {user.projects && user.projects.length > 0 && (
              <div className={styles.detailSection}>
                <h3 className={styles.sectionTitle}>Proyectos ({user.projects.length})</h3>
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

            {/* Tareas asignadas (si el backend las devuelve) */}
            {user.tasks && user.tasks.length > 0 && (
              <div className={styles.detailSection}>
                <h3 className={styles.sectionTitle}>Tareas asignadas ({user.tasks.length})</h3>
                <ul className={styles.taskList}>
                  {user.tasks.map((task) => {
                    const statusKey = `status-${task.status}`;
                    const priorityKey = `priority-${task.priority}`;
                    return (
                      <li key={task.id} className={styles.taskItem}>
                        <div className={styles.taskTitle}>{task.title}</div>
                        <div className={styles.taskMeta}>
                          <span className={`${styles.taskStatus} ${getStyle(styles, statusKey)}`}>
                            {task.status === 'todo' && 'Por hacer'}
                            {task.status === 'doing' && 'En progreso'}
                            {task.status === 'done' && 'Completada'}
                          </span>
                          <span className={`${styles.taskPriority} ${getStyle(styles, priorityKey)}`}>
                            {task.priority === 'low' && 'Baja'}
                            {task.priority === 'medium' && 'Media'}
                            {task.priority === 'high' && 'Alta'}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Mensaje si no tiene proyectos ni tareas */}
            {(!user.projects || user.projects.length === 0) && 
             (!user.tasks || user.tasks.length === 0) && (
              <div className={styles.emptySection}>
                <p>Este usuario aún no tiene proyectos ni tareas asignadas.</p>
              </div>
            )}
          </div>
        );
      }}
    />
  );
}