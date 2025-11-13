"use client";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/features/universalComponents/sidebarComponents/sidebarComponent";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const hasChecked = useRef(false);

  useEffect(() => {
    // Solo verificar una vez
    if (hasChecked.current) return;
    hasChecked.current = true;

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
    } else {
      // Usar setTimeout para evitar el warning de setState síncrono
      setTimeout(() => setIsChecking(false), 0);
    }
  }, [router]);

  // Mostrar nada mientras verifica o si no hay token
  if (isChecking) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Cargando...</div>;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: "auto" }}>{children}</main>
    </div>
  );
}