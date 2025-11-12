"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./sidebarComponents.module.css";

type NavItem = { href: string; label: string; icon?: React.ReactNode };

const DEFAULT_NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="3" y="3" width="8" height="8" rx="1" fill="currentColor"/></svg>) },
  { href: "/user", label: "Usuarios", icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="12" cy="8" r="3" fill="currentColor"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>) },
  // Entry para la lista de proyectos
  { href: "/project", label: "Proyectos", icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="3" y="4" width="18" height="6" rx="1" fill="currentColor"/><rect x="3" y="14" width="9" height="6" rx="1" fill="currentColor"/></svg>) },
  // Opcional: acceso directo para crear nuevo proyecto
  { href: "/project/new", label: "Nuevo proyecto", icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>) },
  { href: "/tasks", label: "Tareas", icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>) },
];

type Props = {
  items?: NavItem[];
  defaultCollapsed?: boolean;
  className?: string;
};

export default function SidebarComponent({ items = DEFAULT_NAV, defaultCollapsed = false, className }: Props) {
  const [collapsed, setCollapsed] = useState<boolean>(defaultCollapsed);
  const pathname = usePathname() ?? "/";

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""} ${className ?? ""}`} aria-label="Barra lateral principal">
      <div className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden>LN</span>
          {!collapsed && <span className={styles.title}>Lynxus</span>}
        </div>

        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed((c) => !c)}
          aria-pressed={collapsed}
          aria-label={collapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
        >
          {collapsed ? "➤" : "◀"}
        </button>
      </div>

      <nav className={styles.nav} role="navigation" aria-label="Navegación principal">
        <ul>
          {items.map((n) => {
            // active cuando la ruta actual es exactamente la href o comienza con href + '/'
            const active = pathname === n.href || pathname.startsWith(n.href + "/");
            return (
              <li key={n.href}>
                <Link href={n.href} className={`${styles.link} ${active ? styles.active : ""}`} aria-current={active ? "page" : undefined}>
                  <span className={styles.icon} aria-hidden>{n.icon}</span>
                  {!collapsed && <span className={styles.label}>{n.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.footer}>
        <button className={styles.smallBtn} aria-label="Cuenta">Cuenta</button>
        {!collapsed && <div className={styles.help}>v1.0</div>}
      </div>
    </aside>
  );
}