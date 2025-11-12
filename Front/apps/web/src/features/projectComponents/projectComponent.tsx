"use client";

import React, { useEffect, useMemo, useState } from "react";
import TableUniversal, { Column } from "../universalComponents/tableUniversalComponents/tableUniversal";
import ProjectDetail from "./detailProject";
import styles from "./projectPage.module.css";
import * as projectService from "./projectService/projectService";
import ProjectCreateComponent from "./projectCreateComponent";

type ProjectItem = projectService.ProjectItem;

export default function ProjectList() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0); // se incrementa cuando se crea un proyecto

  useEffect(() => {
    let mounted = true;
    React.startTransition(() => setLoading(true));

    async function load() {
      try {
        const { items } = await projectService.listProjects({ q: query, page: 1, page_size: 50 });
        if (!mounted) return;
        setProjects(items ?? []);
      } catch {
        if (!mounted) return;
        setProjects([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [query, reloadKey]); // re-ejecuta cuando reloadKey cambia

  const columns: Column<ProjectItem>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Proyecto",
        accessor: (p) => (
          <div className={styles.projectCell}>
            <div className={styles.projectName}>{p.name}</div>
            <div className={styles.projectOwner}>{p.owner}</div>
          </div>
        ),
        width: "50%",
      },
      {
        id: "status",
        header: "Estado",
        accessor: "status",
        width: "20%",
      },
      {
        id: "created_at",
        header: "Creado",
        accessor: (p) => (p.created_at ? new Date(p.created_at).toLocaleDateString() : "-"),
        width: "20%",
        align: "right",
      },
    ],
    []
  );

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h2>Proyectos</h2>
        <div className={styles.controls}>
          <input
            className={styles.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar proyectos..."
          />

          <ProjectCreateComponent
            defaultOpen={false}
            onCreated={() => setReloadKey(prev => prev + 1)}
          />
        </div>
      </header>

      <TableUniversal
        columns={columns}
        data={projects}
        loading={loading}
        rowKey={(p) => p.id}
        actions={(p) => (
          <div>
            <button className={styles.btn} onClick={() => { setSelectedId(p.id); setOpen(true); }}>
              Ver
            </button>
          </div>
        )}
      />

      <ProjectDetail projectId={selectedId} open={open} onClose={() => { setOpen(false); setSelectedId(null); }} />
    </section>
  );
}