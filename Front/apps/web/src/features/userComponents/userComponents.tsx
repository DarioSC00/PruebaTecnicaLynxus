"use client";

import React, { useEffect, useState } from "react";
import TableUniversal from "../universalComponents/tableUniversalComponents/tableUniversal";
import UserDetail from "./userDetail";
import * as userService from "./userService/userService";
import styles from "./userPage.module.css";

export default function UserList() {
  const [users, setUsers] = useState<userService.UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    React.startTransition(() => setLoading(true));
    (async () => {
      try {
        const res = await userService.listUsers({ q: query, page: 1, page_size: 50 });
        if (!mounted) return;
        React.startTransition(() => setUsers(res.items));
      } catch (err) {
        console.error("❌ listUsers error:", err);
        if (mounted) React.startTransition(() => setUsers([]));
      } finally {
        if (mounted) React.startTransition(() => setLoading(false));
      }
    })();
    return () => { mounted = false; };
  }, [query, reloadKey]);

  const columns = [
    { id: "name", header: "Nombre", accessor: "name" as keyof userService.UserItem },
    { id: "email", header: "Email", accessor: "email" as keyof userService.UserItem },
    { id: "created_at", header: "Registrado", accessor: (i: userService.UserItem) => i.created_at ?? "-" },
  ];

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Usuarios</h1>
        <div className={styles.pageActions}>
          <input
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar usuarios..."
          />
          <button 
            className={styles.btnSecondary}
            onClick={() => setReloadKey(k => k + 1)}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Recargar
          </button>
        </div>
      </header>

      <div className={styles.pageContent}>
        {loading && <p className={styles.emptyState}>Cargando usuarios...</p>}
        {!loading && users.length === 0 && (
          <div className={styles.emptyState}>
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <p>No hay usuarios registrados</p>
            <small>Los usuarios se crean mediante el formulario de registro</small>
          </div>
        )}
        {!loading && users.length > 0 && (
          <TableUniversal<userService.UserItem>
            columns={columns}
            data={users}
            loading={loading}
            rowKey={(u) => u.id}
            onRowClick={(u) => { setSelectedId(u.id); setOpen(true); }}
            actions={(u) => (
              <button
                className={styles.btn}
                onClick={(e) => { e.stopPropagation(); setSelectedId(u.id); setOpen(true); }}
              >
                Ver detalles
              </button>
            )}
          />
        )}
      </div>

      <UserDetail userId={selectedId} open={open} onClose={() => { setOpen(false); setSelectedId(null); }} />
    </div>
  );
}