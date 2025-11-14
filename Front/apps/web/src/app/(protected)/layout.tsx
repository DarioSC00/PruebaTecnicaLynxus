"use client";

import React from "react";
import SidebarComponent from "@/features/universalComponents/sidebarComponents/sidebarComponent";
import NavbarComponent from "@/features/universalComponents/navbarComponent/navbarComponent";
import "./layouth.css";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      setIsAuthenticated(!!token);
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <div className="protectedLayout">
      {isAuthenticated && <SidebarComponent />}
      <div className="mainWrapper">
        {isAuthenticated && <NavbarComponent />}
        <main className="mainContent" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}