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
    { id: "name", header: "Nombre", accessor: "name" as keyof projectService.ProjectItem },
    { id: "description", header: "Descripción", accessor: (i: projectService.ProjectItem) => i.description ?? "-" },
    { id: "created_at", header: "Creado", accessor: (i: projectService.ProjectItem) => i.created_at ?? "-" },
  ];

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Proyectos</h1>
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
        {loading && <p>Cargando proyectos...</p>}
        {!loading && projects.length === 0 && <p>No hay proyectos</p>}
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
                Ver
              </button>
            )}
          />
        )}
      </div>

      <ProjectDetail projectId={selectedId} open={open} onClose={() => { setOpen(false); setSelectedId(null); }} />
    </div>
  );
}