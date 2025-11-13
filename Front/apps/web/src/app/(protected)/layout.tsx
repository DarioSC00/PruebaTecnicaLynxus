"use client";

import React from "react";
import SidebarComponent from "@/features/universalComponents/sidebarComponents/sidebarComponent";
import NavbarComponent from "@/features/universalComponents/navbarComponent/navbarComponent";
import "./layouth.css";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = true; // Replace with actual authentication logic

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