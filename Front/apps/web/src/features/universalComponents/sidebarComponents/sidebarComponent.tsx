"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./sidebarComponents.module.css";

type NavItem = { href: string; label: string; icon?: React.ReactNode };

const NAV: NavItem[] = [
  { 
    href: "/", 
    label: "Dashboard",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    )
  },
  { 
    href: "/user", 
    label: "Usuarios",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )
  },
  { 
    href: "/project", 
    label: "Proyectos",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    )
  },
  { 
    href: "/project/new", 
    label: "Nuevo proyecto",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    )
  },
  { 
    href: "/task", 
    label: "Tareas",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    )
  },
];

export default function SidebarComponent() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logo}>LN</div>
        <span className={styles.brandName}>Lynxus</span>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {NAV.map((item, idx) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            
            return (
              <li key={`${item.href}-${idx}`} className={styles.navItem}>
                <Link 
                  href={item.href} 
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.footer}>
        <div className={styles.version}>v1.0</div>
      </div>
    </aside>
  );
}