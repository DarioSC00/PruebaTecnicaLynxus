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

// Reemplazado: evitar depender de un tipo 'any' exportado; definir tipo local claro
type CreateProjectInput = {
  name: string;
  description?: string;
  owner?: string | number;
  status?: string;
};

export default function ProjectCreateComponent({ defaultOpen = false, onCreated }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(Boolean(defaultOpen));
  const [submitting, setSubmitting] = useState<boolean>(false);

  async function handleCreate(values: CreateProjectInput) {
    setSubmitting(true);
    try {
      // pasar directamente el objeto tipado
      await projectService.createProject(values);
      setOpen(false);
      if (typeof onCreated === "function") onCreated();
      router.push("/project");
    } catch (err: unknown) {
      console.error("createProject error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const raw = (projectService as unknown as { STATUS_OPTIONS?: unknown }).STATUS_OPTIONS;
  const isStringArray = (arr: unknown): arr is string[] =>
    Array.isArray(arr) && arr.every((v) => typeof v === "string");
  const STATUS_OPTIONS: string[] = isStringArray(raw) ? (raw as string[]) : ["active", "archived", "planned"];

  return (
    <>
      <button className={styles.btn} onClick={() => setOpen(true)}>
        Nuevo proyecto
      </button>

      {/* Usar el alias de tipo para evitar errores de JSX con genéricos */}
      <CreateUniversalModal<CreateProjectInput>
        open={open}
        onClose={() => setOpen(false)}
        title="Crear proyecto"
        submitLabel={submitting ? "Creando…" : "Crear"}
        initialValues={{ name: "", description: "", owner: "", status: "" } as CreateProjectInput}
        onSubmit={handleCreate}
        renderForm={({ values, setValues }) => (
          <>
            <label className={styles.label}>
              Nombre
              <input
                value={String(values.name ?? "")}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setValues((prev: CreateProjectInput) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Nombre del proyecto"
                required
              />
            </label>

            <label className={styles.label}>
              Descripción
              <textarea
                value={String(values.description ?? "")}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setValues((prev: CreateProjectInput) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Descripción corta"
                rows={4}
              />
            </label>

            <label className={styles.label}>
              Propietario
              <input
                value={String(values.owner ?? "")}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setValues((prev: CreateProjectInput) => ({ ...prev, owner: e.target.value }))
                }
                placeholder="Nombre del propietario"
              />
            </label>

            <label className={styles.label}>
              Estado
              <select
                value={String(values.status ?? "")}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setValues((prev: CreateProjectInput) => ({ ...prev, status: e.target.value }))
                }
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