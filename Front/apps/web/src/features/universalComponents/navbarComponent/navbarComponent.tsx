"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./navbarComponent.module.css";

export default function NavbarComponent() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Cerrar menus al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  // Datos de ejemplo
  const notifications = [
    { id: 1, text: "Nuevo proyecto creado", time: "Hace 5 min", unread: true },
    { id: 2, text: "Tarea completada", time: "Hace 1 hora", unread: true },
    { id: 3, text: "Comentario añadido", time: "Hace 2 horas", unread: false },
  ];

  const userName = "Ruben Salazar";
  const userEmail = "ruben@lynxus.com";

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContent}>
        {/* Sección izquierda - Título/Breadcrumb */}
        <div className={styles.navbarLeft}>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <div className={styles.breadcrumb}>
            <span>Inicio</span>
            <span className={styles.separator}>/</span>
            <span className={styles.breadcrumbActive}>Dashboard</span>
          </div>
        </div>

        {/* Sección derecha - Acciones */}
        <div className={styles.navbarRight}>
          {/* Barra de búsqueda */}
          <div className={styles.searchBox}>
            <svg className={styles.searchIcon} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Buscar..."
              className={styles.searchInput}
            />
          </div>

          {/* Notificaciones */}
          <div className={styles.iconWrapper} ref={notifRef}>
            <button
              className={styles.iconButton}
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notificaciones"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {notifications.some(n => n.unread) && <span className={styles.badge}>{notifications.filter(n => n.unread).length}</span>}
            </button>

            {showNotifications && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <h3>Notificaciones</h3>
                  <button className={styles.markAllRead}>Marcar todas leídas</button>
                </div>
                <ul className={styles.notificationList}>
                  {notifications.map(notif => (
                    <li key={notif.id} className={`${styles.notificationItem} ${notif.unread ? styles.unread : ''}`}>
                      <div className={styles.notificationText}>{notif.text}</div>
                      <div className={styles.notificationTime}>{notif.time}</div>
                    </li>
                  ))}
                </ul>
                <div className={styles.dropdownFooter}>
                  <button className={styles.viewAll}>Ver todas</button>
                </div>
              </div>
            )}
          </div>

          {/* Perfil de usuario */}
          <div className={styles.userWrapper} ref={menuRef}>
            <button
              className={styles.userButton}
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="Menú de usuario"
            >
              <div className={styles.avatar}>
                <span>RS</span>
              </div>
              <div className={styles.userInfo}>
                <div className={styles.userName}>{userName}</div>
                <div className={styles.userRole}>Admin</div>
              </div>
              <svg className={styles.chevron} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showUserMenu && (
              <div className={styles.userDropdown}>
                <div className={styles.userDropdownHeader}>
                  <div className={styles.userDropdownAvatar}>RS</div>
                  <div>
                    <div className={styles.userDropdownName}>{userName}</div>
                    <div className={styles.userDropdownEmail}>{userEmail}</div>
                  </div>
                </div>
                <ul className={styles.userMenu}>
                  <li>
                    <button className={styles.userMenuItem} onClick={() => router.push("/profile")}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Mi Perfil
                    </button>
                  </li>
                  <li>
                    <button className={styles.userMenuItem} onClick={() => router.push("/settings")}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" />
                      </svg>
                      Configuración
                    </button>
                  </li>
                  <li className={styles.divider}></li>
                  <li>
                    <button className={`${styles.userMenuItem} ${styles.logout}`} onClick={handleLogout}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}