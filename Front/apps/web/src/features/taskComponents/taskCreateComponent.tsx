"use client";

import React, { useState } from "react";
import CreateUniversalModal from "../universalComponents/createUniversalComponents/createUniversalModal";
import * as taskService from "./taskService/taskService";

type Props = {
  projectId: number;
  defaultOpen?: boolean;
  onCreated?: () => void;
};

// Tipado local mínimo para el modal (evita `any`).
type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  submitLabel?: string;
  initialValues?: taskService.CreateTaskInput;
  onSubmit?: (values: taskService.CreateTaskInput) => Promise<void> | void;
  loading?: boolean;
  children?: React.ReactNode;
};
const Modal = CreateUniversalModal as unknown as React.ComponentType<ModalProps>;

export default function TaskCreateComponent({ projectId, defaultOpen = false, onCreated }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<taskService.CreateTaskInput>({
    title: "",
    description: "",
    status: "todo",
    priority: "med",
    due_date: null,
    assignee_id: null,
  });

  const handleChange = (field: keyof taskService.CreateTaskInput, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // now receives the values object (CreateTaskInput) instead of a FormEvent
  const handleSubmit = async (values: taskService.CreateTaskInput) => {
    if (!values.title?.trim()) {
      alert("El título es obligatorio");
      return;
    }

    setLoading(true);
    try {
      await taskService.createTask(projectId, values);
      setIsOpen(false);
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "med",
        due_date: null,
        assignee_id: null,
      });
      onCreated?.();
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Error al crear la tarea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: "0.625rem 1rem",
          background: "#6366f1",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "0.875rem",
          fontWeight: 500,
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#4f46e5")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
      >
        + Nueva tarea
      </button>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Crear Nueva Tarea"
        submitLabel={loading ? "Creando…" : "Crear"}
        initialValues={formData}
        onSubmit={async (values: taskService.CreateTaskInput) => {
          await handleSubmit(values);
        }}
        loading={loading}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Título */}
          <div>
            <label
              htmlFor="title"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#374151",
                marginBottom: "0.5rem",
              }}
            >
              Título <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Título de la tarea"
              required
              style={{
                width: "100%",
                padding: "0.625rem",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "0.875rem",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#6366f1";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Descripción */}
          <div>
            <label
              htmlFor="description"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#374151",
                marginBottom: "0.5rem",
              }}
            >
              Descripción
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descripción detallada de la tarea"
              rows={4}
              style={{
                width: "100%",
                padding: "0.625rem",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "0.875rem",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#6366f1";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Estado y Prioridad */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label
                htmlFor="status"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Estado
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.625rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  outline: "none",
                  cursor: "pointer",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#6366f1";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <option value="todo">Por hacer</option>
                <option value="doing">En progreso</option>
                <option value="done">Completado</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="priority"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Prioridad
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.625rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  outline: "none",
                  cursor: "pointer",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#6366f1";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <option value="low">Baja</option>
                <option value="med">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          {/* Fecha límite */}
          <div>
            <label
              htmlFor="due_date"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#374151",
                marginBottom: "0.5rem",
              }}
            >
              Fecha límite
            </label>
            <input
              id="due_date"
              type="date"
              value={formData.due_date || ""}
              onChange={(e) => handleChange("due_date", e.target.value || null)}
              style={{
                width: "100%",
                padding: "0.625rem",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "0.875rem",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#6366f1";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
