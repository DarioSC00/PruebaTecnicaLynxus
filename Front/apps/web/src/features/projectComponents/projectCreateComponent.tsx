"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import CreateUniversalModal from "../universalComponents/createUniversalComponents/createUniversalModal";
import * as projectService from "./projectService/projectService";
import styles from "./projectPage.module.css";

type Props = {
  defaultOpen?: boolean;
  onCreated?: () => void;
};

export default function ProjectCreateComponent({ defaultOpen = false, onCreated }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(Boolean(defaultOpen));
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(values: projectService.ProjectDetail) {
    setSubmitting(true);
    try {
      await projectService.createProject(values);
      setOpen(false);
      if (typeof onCreated === "function") onCreated();
      router.push("/projects");
    } catch (err: unknown) {
      console.error("createProject error:", err);
      // opcional: mostrar notificación al usuario
    } finally {
      setSubmitting(false);
    }
  }

  // Opciones por defecto (reemplazar por las del backend si las provees)
  // obtener y validar STATUS_OPTIONS del servicio sin usar `any`
  const svc = projectService as unknown as { STATUS_OPTIONS?: unknown };
  const rawStatus = svc.STATUS_OPTIONS;
  const isStringArray = (arr: unknown): arr is string[] =>
    Array.isArray(arr) && arr.every((v) => typeof v === "string");
  const STATUS_OPTIONS: string[] = isStringArray(rawStatus)
    ? rawStatus
    : ["active", "archived", "planned"];

  return (
    <>
      <button className={styles.btn} onClick={() => setOpen(true)}>
        Nuevo proyecto
      </button>

      <CreateUniversalModal<projectService.ProjectDetail>
        open={open}
        onClose={() => setOpen(false)}
        title="Crear proyecto"
        submitLabel={submitting ? "Creando…" : "Crear"}
        initialValues={{ name: "", description: "", owner: "", status: "" }}
        onSubmit={handleCreate}
        renderForm={({ values, setValues }) => (
          <>
            <label className={styles.label}>
              Nombre
              <input
                value={String(values.name ?? "")}
                onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del proyecto"
                required
              />
            </label>

            <label className={styles.label}>
              Descripción
              <textarea
                value={String(values.description ?? "")}
                onChange={(e) => setValues((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción corta"
                rows={4}
              />
            </label>

            <label className={styles.label}>
              Propietario
              <input
                value={String(values.owner ?? "")}
                onChange={(e) => setValues((prev) => ({ ...prev, owner: e.target.value }))}
                placeholder="Nombre del propietario"
              />
            </label>

            <label className={styles.label}>
              Estado
              <select
                value={String(values.status ?? "")}
                onChange={(e) => setValues((prev) => ({ ...prev, status: e.target.value }))}
                required
              >
                <option value="">Selecciona estado</option>
                {STATUS_OPTIONS.map((s: string) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
      />
    </>
  );
}