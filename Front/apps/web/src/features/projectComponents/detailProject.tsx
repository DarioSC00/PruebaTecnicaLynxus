"use client";
import React, { useEffect, useState } from "react";
import DetalModal from "../universalComponents/detailUniversalComponents/detailModal";
import styles from "./projectPage.module.css";
import * as projectService from "./projectService/projectService";

type ProjectDetailType = projectService.ProjectDetail;

export default function ProjectDetail({ projectId, open, onClose }: { projectId: number | null; open: boolean; onClose: () => void; }) {
  const [data, setData] = useState<ProjectDetailType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!open || projectId == null) {
      if (mounted) { setData(null); setError(null); setLoading(false); }
      return;
    }
    React.startTransition(() => setLoading(true));
    (async () => {
      try {
        const d = await projectService.getProject(projectId);
        if (!mounted) return;
        React.startTransition(() => setData(d));
      } catch (e) {
        if (!mounted) return;
        setError("No se pudo cargar proyecto");
      } finally {
        if (mounted) React.startTransition(() => setLoading(false));
      }
    })();
    return () => { mounted = false; };
  }, [open, projectId]);

  return (
    <DetalModal open={open} onClose={onClose} title={data?.name ?? "Detalle proyecto"} data={data}
      render={(d) => {
        if (loading) return <p className={styles.center}>Cargando…</p>;
        if (error) return <p className={styles.error}>{error}</p>;
        if (!d) return <p className={styles.meta}>Sin datos</p>;
        return (
          <div>
            <p className={styles.projectDescription}>{d.description ?? "-"}</p>
            <div className={styles.keyValue}>
              <div className={styles.key}>Propietario</div>
              <div className={styles.value}>{d.owner ?? "-"}</div>
            </div>
          </div>
        );
      }}
    />
  );
}