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
    { 
      id: "user", 
      header: "User", 
      accessor: (u: userService.UserItem) => (
        <div className={styles.userCell}>
          <div className={styles.avatar}>
            {u.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{u.name}</div>
            <div className={styles.userEmail}>{u.email}</div>
          </div>
        </div>
      )
    },
    { 
      id: "is_active", 
      header: "Status", 
      accessor: (u: userService.UserItem) => (
        <span className={styles.activeBadge} data-active={u.is_active ? "true" : "false"}>
          {u.is_active ? "Active" : "Inactive"}
        </span>
      )
    },
    { 
      id: "created_at", 
      header: "Registered", 
      accessor: (u: userService.UserItem) => {
        if (!u.created_at) return "-";
        const date = new Date(u.created_at);
        return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
      }
    },
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.breadcrumb}>
        <span className={styles.breadcrumbText}>Users</span>
      </div>
      
      <header className={styles.pageHeader}>
        <h2 className={styles.pageCount}>
          {loading ? "Loading..." : `${users.length} user${users.length !== 1 ? 's' : ''}`}
        </h2>
        <div className={styles.pageActions}>
          <input
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
          />
        </div>
      </header>

      <div className={styles.pageContent}>
        {loading && <p className={styles.loadingState}>Loading users...</p>}
        {!loading && users.length === 0 && (
          <div className={styles.emptyState}>
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p>No registered users</p>
            <small>Users are created through the registration form</small>
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
                View details
              </button>
            )}
          />
        )}
      </div>

      <UserDetail userId={selectedId} open={open} onClose={() => { setOpen(false); setSelectedId(null); }} />
    </div>
  );
}