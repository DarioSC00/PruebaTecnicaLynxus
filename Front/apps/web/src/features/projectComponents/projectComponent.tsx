"use client";

import React, { useEffect, useState } from "react";
import TableUniversal from "../universalComponents/tableUniversalComponents/tableUniversal";
import ProjectCreateComponent from "./projectCreateComponent";
import ProjectDetail from "./detailProject";
import * as projectService from "./projectService/projectService";
import styles from "./projectPage.module.css";

export default function ProjectList() {
  const [projects, setProjects] = useState<projectService.ProjectItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    React.startTransition(() => setLoading(true));
    (async () => {
      try {
        const res = await projectService.listProjects({ q: query, page: 1, page_size: 50 });
        if (!mounted) return;
        React.startTransition(() => setProjects(res.items));
        console.log("✅ listProjects response:", res);
      } catch (err) {
        console.error("❌ listProjects error:", err);
        if (mounted) React.startTransition(() => setProjects([]));
      } finally {
        if (mounted) React.startTransition(() => setLoading(false));
      }
    })();
    return () => { mounted = false; };
  }, [query, reloadKey]);

  const columns = [
    { 
      id: "project", 
      header: "Proyecto", 
      accessor: (p: projectService.ProjectItem) => (
        <div className={styles.projectCell}>
          <div className={styles.projectName}>{p.name}</div>
          <div className={styles.projectDescription}>{p.description || "Sin descripción"}</div>
        </div>
      )
    },
    { 
      id: "status", 
      header: "Estado", 
      accessor: (p: projectService.ProjectItem) => (
        <span className={styles.statusBadge} data-status={p.status}>
          {p.status === 'in_progress' ? 'En progreso' : 
           p.status === 'completed' ? 'Completado' : 
           p.status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
        </span>
      )
    },
    { 
      id: "created_at", 
      header: "Creado", 
      accessor: (p: projectService.ProjectItem) => {
        if (!p.created_at) return "-";
        const date = new Date(p.created_at);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
      }
    },
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.breadcrumb}>
        <span className={styles.breadcrumbText}>Proyectos</span>
      </div>
      
      <header className={styles.pageHeader}>
        <h2 className={styles.pageCount}>
          {loading ? "Cargando..." : `${projects.length} proyecto${projects.length !== 1 ? 's' : ''}`}
        </h2>
        <div className={styles.pageActions}>
          <input
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar proyectos..."
          />
          <ProjectCreateComponent defaultOpen={false} onCreated={() => setReloadKey(k => k + 1)} />
        </div>
      </header>

      <div className={styles.pageContent}>
        {loading && <p className={styles.loadingState}>Cargando proyectos...</p>}
        {!loading && projects.length === 0 && (
          <div className={styles.emptyState}>
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p>No hay proyectos</p>
            <small>Crea tu primer proyecto para comenzar</small>
          </div>
        )}
        {!loading && projects.length > 0 && (
          <TableUniversal<projectService.ProjectItem>
            columns={columns}
            data={projects}
            loading={loading}
            rowKey={(p) => p.id}
            onRowClick={(p) => { setSelectedId(p.id); setOpen(true); }}
            actions={(p) => (
              <button
                className={styles.btn}
                onClick={(e) => { e.stopPropagation(); setSelectedId(p.id); setOpen(true); }}
              >
                Ver detalles
              </button>
            )}
          />
        )}
      </div>

      <ProjectDetail projectId={selectedId} open={open} onClose={() => { setOpen(false); setSelectedId(null); }} />
    </div>
  );
}