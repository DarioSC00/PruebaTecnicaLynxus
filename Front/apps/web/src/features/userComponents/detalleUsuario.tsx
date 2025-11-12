"use client";

import React, { useEffect, useState } from "react";
import api from "../../../axios/axios";
import DetalModal from "../universalComponents/detailUniversalComponents/detalModal";
import styles from "./userPage.module.css";

type UserDetail = {
  id: number;
  name?: string | null;
  email: string;
  created_at?: string | null;
};

type Props = {
  userId: number | null;
  open: boolean;
  onClose: () => void;
  title?: string;
};

export default function DetalleUsuario({ userId, open, onClose, title }: Props) {
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!open || userId == null) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/users/${userId}`);
        if (!mounted) return;
        setData(res.data as UserDetail);
      } catch (_err) {
        if (!mounted) return;
        setError("No se pudo cargar el usuario.");
        setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [open, userId]);

  return (
    <DetalModal
      open={open}
      onClose={onClose}
      title={title ?? data?.name ?? "Detalle usuario"}
      data={data}
      render={(d) => {
        if (loading) return <p className={styles.center}>Cargando…</p>;
        if (error) return <p className={styles.error}>{error}</p>;
        if (!d) return <p className={styles.meta}>Sin datos</p>;

        return (
          <div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <div className={styles.avatar} style={{ width: 72, height: 72, fontSize: 20 }}>
                {((d as UserDetail).name || (d as UserDetail).email || "U").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>{(d as UserDetail).name}</p>
                <p style={{ margin: 0, color: "#64748b" }}>{(d as UserDetail).email}</p>
                <p style={{ marginTop: 6, color: "#94a3b8", fontSize: 13 }}>
                  Creado: {(d as UserDetail).created_at ? new Date((d as UserDetail).created_at!).toLocaleString() : "-"}
                </p>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}