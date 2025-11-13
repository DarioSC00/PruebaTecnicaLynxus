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
  const [submitting, setSubmitting] = useState<boolean>(false);

  // usar tipo CreateProjectInput
  async function handleCreate(values: projectService.CreateProjectInput) {
    setSubmitting(true);
    try {
      await projectService.createProject(values);
      setOpen(false);
      if (typeof onCreated === "function") onCreated();
      router.push("/project"); // ajustar ruta según tu app (antes /projects)
    } catch (err: unknown) {
      console.error("createProject error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  // Usar STATUS_OPTIONS exportado si existe, si no fallback
  const raw = (projectService as unknown as { STATUS_OPTIONS?: unknown }).STATUS_OPTIONS;
  const isStringArray = (arr: unknown): arr is string[] =>
    Array.isArray(arr) && arr.every((v) => typeof v === "string");
  const STATUS_OPTIONS: string[] = isStringArray(raw) ? raw : projectService.STATUS_OPTIONS ?? ["active", "archived", "planned"];

  return (
    <>
      <button className={styles.btn} onClick={() => setOpen(true)}>
        Nuevo proyecto
      </button>

      <CreateUniversalModal<projectService.CreateProjectInput>
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