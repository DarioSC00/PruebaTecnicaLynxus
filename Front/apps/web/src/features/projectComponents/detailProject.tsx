"use client";
import React, { useEffect, useState } from "react";
import DetalModal from "../universalComponents/detailUniversalComponents/detailModal";
import styles from "./projectPage.module.css";
import * as projectService from "./projectService/projectService";
import * as userService from "../userComponents/userService/userService";

type ProjectDetailType = projectService.ProjectDetail;
type UserDetailType = userService.UserDetail; // reemplazado 'any' por el tipo exportado

// Extiende ProjectDetail con campos que el backend puede devolver de forma alternativa
type ExtendedProject = ProjectDetailType & {
  owner?: string | { id: number; name?: string; email?: string };
  owner_name?: string;
  owner_id?: number;
  status?: string;
  archived?: boolean;
};

function isOwnerObject(o: unknown): o is { id: number; name?: string; email?: string } {
  // evitar 'any' usando Record<string, unknown>
  return typeof o === "object" && o !== null && "id" in (o as Record<string, unknown>);
}

export default function ProjectDetail({
  projectId,
  open,
  onClose,
}: {
  projectId: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const [data, setData] = useState<ProjectDetailType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!open || projectId == null) {
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
        const d = (await projectService.getProject(projectId)) as ExtendedProject;
        console.log("getProject raw:", d);

        // Si backend devuelve owner_id pero no owner, intentar obtener nombre del usuario
        if (d && typeof d.owner === "undefined" && typeof d.owner_id === "number") {
          try {
            const u: UserDetailType = await userService.getUser(d.owner_id);
            if (u && mounted) {
              // usar propiedades con tipado en lugar de 'any'
              d.owner = u.name ?? u.email ?? `#${d.owner_id}`;
            }
          } catch (err) {
            console.warn("No se pudo obtener owner por owner_id", d.owner_id, err);
          }
        }

        if (!mounted) return;
        React.startTransition(() => setData(d));
      } catch (err) {
        if (!mounted) return;
        setError("No se pudo cargar proyecto");
        console.error("getProject error:", err);
      } finally {
        if (mounted) React.startTransition(() => setLoading(false));
      }
    })();
    return () => {
      mounted = false;
    };
  }, [open, projectId]);

  return (
    <DetalModal
      open={open}
      onClose={onClose}
      title={data?.name ?? "Detalle proyecto"}
      data={data}
      render={(d: ExtendedProject | null) => {
        if (loading) return <p className={styles.center}>Cargando…</p>;
        if (error) return <p className={styles.error}>{error}</p>;
        if (!d) return <p className={styles.meta}>Sin datos</p>;

        // ownerLabel seguro sin usar any
        const ownerLabel = (() => {
          if (typeof d.owner === "string") return d.owner;
          if (isOwnerObject(d.owner)) return d.owner.name ?? d.owner.email ?? `#${d.owner.id}`;
          if (typeof d.owner_name === "string") return d.owner_name;
          if (typeof d.owner_id === "number") return `#${d.owner_id}`;
          return "-";
        })();

        const statusLabel = (() => {
          if (d.archived === true) return "Archivado";
          if (d.archived === false) return "Activo";
          if (typeof d.status === "string") return d.status;
          return "Desconocido";
        })();

        return (
          <div>
            <p className={styles.projectDescription}>{d.description ?? "-"}</p>

            <div className={styles.keyValue}>
              <div className={styles.key}>Propietario</div>
              <div className={styles.value}>{ownerLabel}</div>
            </div>

            <div className={styles.keyValue}>
              <div className={styles.key}>Estado</div>
              <div className={styles.value}>{statusLabel}</div>
            </div>
          </div>
        );
      }}
    />
  );
}