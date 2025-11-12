"use client";

import React, { useEffect, useMemo, useState } from "react";
import api from "../../../axios/axios";
import Link from "next/link";
import styles from "./userPage.module.css";
import DetalModal from "../universalComponents/detailUniversalComponents/detalModal";
import TableUniversal, { Column } from "../universalComponents/tableUniversalComponents/tableUniversal";

type UserItem = {
  id: number;
  name?: string | null;
  email: string;
  created_at?: string | null;
};

type UserDetail = {
  id: number;
  name?: string | null;
  email: string;
  created_at?: string | null;
};

export default function User() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 8;

  // modal / detalle
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/users", {
          params: { page, page_size: pageSize, q: query || undefined },
        });
        if (!mounted) return;
        const data = res.data;
        setUsers(data.items || []);
        setTotal(typeof data.total === "number" ? data.total : (data.items || []).length);
      } catch (err) {
        setError("No se pudieron cargar los usuarios desde la API.");
        setUsers([]);
        setTotal(0);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchUsers();
    return () => {
      mounted = false;
    };
  }, [page, query]);

  function initials(name?: string | null) {
    if (!name) return "U";
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  async function openUserModal(id: number) {
    setModalOpen(true);
    setModalLoading(true);
    setModalError(null);
    setSelectedUser(null);
    try {
      const res = await api.get(`/users/${id}`);
      setSelectedUser(res.data as UserDetail);
    } catch (err) {
      setModalError("No se pudo cargar el detalle del usuario.");
    } finally {
      setModalLoading(false);
    }
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedUser(null);
    setModalError(null);
    setModalLoading(false);
  }

  const columns: Column<UserItem>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Nombre",
        accessor: (u) => (
          <div className={styles.rowUser}>
            <div className={`${styles.avatar} ${styles.avatarSmall}`}>{initials(u.name)}</div>
            <div className={styles.nameWrap}>
              <div className={`${styles.name} ${styles.nameTruncated}`}>{u.name ?? "Usuario"}</div>
              <div className={styles.emailSmall}>{u.email}</div>
            </div>
          </div>
        ),
        width: "45%",
      },
      {
        id: "email",
        header: "Email",
        accessor: "email",
        width: "35%",
      },
      {
        id: "created_at",
        header: "Creado",
        accessor: (u) => (u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"),
        width: "20%",
        align: "right",
      },
    ],
    []
  );

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Usuarios</h2>
          <p className={styles.subtitle}>Gestiona los usuarios de la aplicación</p>
        </div>
        <div className={styles.controls}>
          <input
            aria-label="Buscar usuarios"
            placeholder="Buscar por nombre o email..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className={styles.search}
          />
        </div>
      </header>

      {error && <p className={styles.error}>{error}</p>}

      <TableUniversal
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No hay usuarios."
        rowKey={(u) => u.id}
        actions={(u) => (
          <div className={styles.actions}>
            <button className={styles.btn} onClick={() => openUserModal(u.id)}>Ver</button>
          </div>
        )}
      />

      <DetalModal
        open={modalOpen}
        onClose={closeModal}
        title={selectedUser?.name ?? "Detalle usuario"}
        data={selectedUser}
        render={(data) => {
          if (modalLoading) return <p className={styles.center}>Cargando…</p>;
          if (modalError) return <p className={styles.error}>{modalError}</p>;
          if (!data) return <p className={styles.meta}>Sin datos</p>;

          return (
            <div>
              <div className={styles.modalHeader}>
                <div className={`${styles.avatar} ${styles.avatarLarge}`}>{initials((data as UserDetail).name)}</div>
                <div>
                  <p className={styles.modalName}>{(data as UserDetail).name}</p>
                  <p className={styles.modalEmail}>{(data as UserDetail).email}</p>
                  <p className={styles.modalCreated}>
                    Creado: {(data as UserDetail).created_at ? new Date((data as UserDetail).created_at!).toLocaleString() : "-"}
                  </p>
                </div>
              </div>
            </div>
          );
        }}
      />
    </section>
  );
}