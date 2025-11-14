"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import CreateUniversalModal from "../universalComponents/createUniversalComponents/createUniversalModal";
import * as projectService from "./projectService/projectService";
import styles from "./projectPage.module.css";
import { toast } from "react-toastify";

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
      toast.success("Project created successfully");
      setOpen(false);
      if (typeof onCreated === "function") onCreated();
      router.push("/project");
    } catch (err: unknown) {
      console.error("createProject error:", err);
      toast.error("Error creating project. Please try again.");
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
        New Project
      </button>

      {/* Use type alias to avoid JSX errors with generics */}
      <CreateUniversalModal<CreateProjectInput>
        open={open}
        onClose={() => setOpen(false)}
        title="Create Project"
        submitLabel={submitting ? "Creating…" : "Create"}
        initialValues={{ name: "", description: "", owner: "", status: "" } as CreateProjectInput}
        onSubmit={handleCreate}
        renderForm={({ values, setValues }) => (
          <>
            <div>
              <label htmlFor="project-name">
                Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                id="project-name"
                value={String(values.name ?? "")}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setValues((prev: CreateProjectInput) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Project name"
                required
              />
            </div>

            <div>
              <label htmlFor="project-description">Description</label>
              <textarea
                id="project-description"
                value={String(values.description ?? "")}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setValues((prev: CreateProjectInput) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Short description"
                rows={4}
              />
            </div>

            <div>
              <label htmlFor="project-status">
                Status <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                id="project-status"
                value={String(values.status ?? "")}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setValues((prev: CreateProjectInput) => ({ ...prev, status: e.target.value }))
                }
                required
              >
                <option value="">Select status</option>
                {STATUS_OPTIONS.map((s: string) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      />
    </>
  );
}