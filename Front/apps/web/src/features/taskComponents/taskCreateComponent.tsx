"use client";

import React, { useState, useEffect } from "react";
import CreateUniversalModal from "../universalComponents/createUniversalComponents/createUniversalModal";
import * as taskService from "./taskService/taskService";
import * as userService from "../userComponents/userService/userService";

type Props = {
  projectId: number;
  defaultOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
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
  renderForm: (args: {
    values: taskService.CreateTaskInput;
    setValues: React.Dispatch<React.SetStateAction<taskService.CreateTaskInput>>;
    submitting: boolean;
  }) => React.ReactNode;
};
const Modal = CreateUniversalModal as unknown as React.ComponentType<ModalProps>;

export default function TaskCreateComponent({ projectId, defaultOpen = false, open, onClose, onCreated }: Props) {
  // Usar open si se proporciona, sino defaultOpen
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const modalOpen = open !== undefined ? open : isOpen;
  
  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<userService.UserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState<userService.UserItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const [formData, setFormData] = useState<taskService.CreateTaskInput>({
    title: "",
    description: "",
    status: "todo",
    priority: "med",
    due_date: null,
    assignee_id: null,
  });

  // Sincronizar assignee_id con el primer usuario asignado
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      assignee_id: assignedUsers.length > 0 ? assignedUsers[0].id : null
    }));
  }, [assignedUsers]);

  const handleChange = (field: keyof taskService.CreateTaskInput, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddUser = () => {
    if (!selectedUserId) return;
    const userId = Number(selectedUserId);
    const user = users.find(u => u.id === userId);
    if (user && !assignedUsers.find(u => u.id === userId)) {
      setAssignedUsers(prev => [...prev, user]);
      setSelectedUserId("");
    }
  };

  const handleRemoveUser = (userId: number) => {
    setAssignedUsers(prev => prev.filter(u => u.id !== userId));
  };

  // Cargar usuarios cuando se abre el modal
  useEffect(() => {
    if (modalOpen && users.length === 0) {
      (async () => {
        setLoadingUsers(true);
        try {
          const res = await userService.listUsers({ page: 1, page_size: 100 });
          setUsers(res.items ?? []);
        } catch (err) {
          console.error("Error loading users:", err);
        } finally {
          setLoadingUsers(false);
        }
      })();
    }
  }, [modalOpen, users.length]);

  // now receives the values object (CreateTaskInput) instead of a FormEvent
  const handleSubmit = async (values: taskService.CreateTaskInput) => {
    if (!values.title?.trim()) {
      alert("El título es obligatorio");
      return;
    }

    setLoading(true);
    try {
      await taskService.createTask(projectId, values);
      handleClose();
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "med",
        due_date: null,
        assignee_id: null,
      });
      setAssignedUsers([]);
      setSelectedUserId("");
      onCreated?.();
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Error al crear la tarea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={modalOpen}
      onClose={handleClose}
      title="Crear Nueva Tarea"
      submitLabel={loading ? "Creando…" : "Crear"}
      initialValues={formData}
        onSubmit={async (values: taskService.CreateTaskInput) => {
          await handleSubmit(values);
        }}
        renderForm={({ values, setValues }) => (
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
              value={values.title}
              onChange={(e) => setValues(prev => ({ ...prev, title: e.target.value }))}
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
              value={values.description}
              onChange={(e) => setValues(prev => ({ ...prev, description: e.target.value }))}
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
                value={values.status}
                onChange={(e) => setValues(prev => ({ ...prev, status: e.target.value as taskService.StatusType }))}
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
                value={values.priority}
                onChange={(e) => setValues(prev => ({ ...prev, priority: e.target.value as taskService.PriorityType }))}
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

          {/* Asignar a Usuario */}
          <div>
            <label
              htmlFor="assignee_select"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#374151",
                marginBottom: "0.5rem",
              }}
            >
              Asignar usuarios
            </label>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <select
                id="assignee_select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={loadingUsers}
                style={{
                  flex: 1,
                  padding: "0.625rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  outline: "none",
                  cursor: "pointer",
                  boxSizing: "border-box",
                  backgroundColor: loadingUsers ? "#f9fafb" : "white",
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
                <option value="">Seleccionar usuario...</option>
                {loadingUsers ? (
                  <option value="">Cargando usuarios...</option>
                ) : (
                  users
                    .filter(u => !assignedUsers.find(au => au.id === u.id))
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.email}
                      </option>
                    ))
                )}
              </select>
              <button
                type="button"
                onClick={handleAddUser}
                disabled={!selectedUserId}
                style={{
                  padding: "0.625rem 1rem",
                  background: selectedUserId ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" : "#e5e7eb",
                  color: selectedUserId ? "white" : "#94a3b8",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: selectedUserId ? "pointer" : "not-allowed",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                }}
              >
                + Agregar
              </button>
            </div>
            
            {/* Lista de usuarios asignados */}
            {assignedUsers.length > 0 && (
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                padding: "0.75rem",
                background: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}>
                {assignedUsers.map((user) => (
                  <div
                    key={user.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.375rem 0.75rem",
                      background: "white",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      fontSize: "0.875rem",
                    }}
                  >
                    <span style={{ color: "#374151" }}>{user.name || user.email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveUser(user.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        fontSize: "1rem",
                        lineHeight: 1,
                        padding: "0 0.25rem",
                      }}
                      aria-label={`Quitar ${user.name || user.email}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {assignedUsers.length === 0 && (
              <div style={{
                padding: "0.75rem",
                textAlign: "center",
                color: "#94a3b8",
                fontSize: "0.85rem",
                background: "#f9fafb",
                borderRadius: "8px",
                border: "1px dashed #e5e7eb",
              }}>
                No hay usuarios asignados
              </div>
            )}
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
              value={values.due_date || ""}
              onChange={(e) => setValues(prev => ({ ...prev, due_date: e.target.value || null }))}
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
        )}
      />
  );
}
